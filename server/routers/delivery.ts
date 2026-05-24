import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { orders, notifications } from "../../drizzle/schema";
import { createNotification } from "../db";

/**
 * Delivery team procedure - allows users with delivery_team role
 */
const deliveryTeamProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin" && ctx.user?.role !== "user") {
    // In a real app, you'd have a separate 'delivery_team' role
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only delivery team members can access this resource",
    });
  }
  return next({ ctx });
});

export const deliveryRouter = router({
  /**
   * Get pending deliveries for the local team
   */
  getPendingDeliveries: deliveryTeamProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    try {
      const pendingOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.status, "handed_to_local_team"));

      return {
        success: true,
        deliveries: pendingOrders,
        count: pendingOrders.length,
      };
    } catch (error) {
      console.error("Failed to get pending deliveries:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get pending deliveries",
      });
    }
  }),

  /**
   * Update delivery status
   */
  updateDeliveryStatus: deliveryTeamProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["in_transit", "out_for_delivery", "delivered", "failed"]),
        notes: z.string().optional(),
        deliveryDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Get the order
        const order = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!order || order.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Update order status
        const newStatus = input.status === "delivered" ? "delivered" : "handed_to_local_team";
        await db
          .update(orders)
          .set({
            status: newStatus,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, input.orderId));

        // Send notification to customer
        const notificationTitles: Record<string, string> = {
          in_transit: "配送中です",
          out_for_delivery: "本日配送予定です",
          delivered: "配送完了しました",
          failed: "配送に問題が発生しました",
        };

        const notificationContents: Record<string, string> = {
          in_transit: `ご注文 #${input.orderId} は配送中です。追跡情報をご確認ください。`,
          out_for_delivery: `ご注文 #${input.orderId} は本日配送予定です。ご在宅ください。`,
          delivered: `ご注文 #${input.orderId} が配送完了しました。ご確認ください。`,
          failed: `ご注文 #${input.orderId} の配送に問題が発生しました。サポートにお問い合わせください。`,
        };

        await createNotification(
          order[0].userId,
          "delivery_update",
          notificationTitles[input.status],
          notificationContents[input.status],
          input.orderId
        );

        return {
          success: true,
          message: `Delivery status updated to ${input.status}`,
          order: {
            id: input.orderId,
            status: newStatus,
          },
        };
      } catch (error) {
        console.error("Failed to update delivery status:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update delivery status",
        });
      }
    }),

  /**
   * Get delivery history for an order
   */
  getDeliveryHistory: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Get the order
        const order = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!order || order.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Verify user owns this order
        if (order[0].userId !== ctx.user?.id && ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view this delivery history",
          });
        }

        // Return order with delivery information
        return {
          success: true,
          order: {
            id: order[0].id,
            status: order[0].status,
            createdAt: order[0].createdAt,
            updatedAt: order[0].updatedAt,
          },
        };
      } catch (error) {
        console.error("Failed to get delivery history:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get delivery history",
        });
      }
    }),

  /**
   * Confirm delivery completion
   */
  confirmDelivery: deliveryTeamProcedure
    .input(
      z.object({
        orderId: z.number(),
        recipientName: z.string(),
        recipientSignature: z.string().optional(),
        photoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Get the order
        const order = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!order || order.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Update order status to delivered
        await db
          .update(orders)
          .set({
            status: "delivered",
            updatedAt: new Date(),
          })
          .where(eq(orders.id, input.orderId));

        // Send final notification to customer
        await createNotification(
          order[0].userId,
          "delivery_completed",
          "配送完了のお知らせ",
          `ご注文 #${input.orderId} が正常に配送完了しました。ご利用ありがとうございました。`,
          input.orderId
        );

        return {
          success: true,
          message: "Delivery confirmed successfully",
          order: {
            id: input.orderId,
            status: "delivered",
            recipientName: input.recipientName,
          },
        };
      } catch (error) {
        console.error("Failed to confirm delivery:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to confirm delivery",
        });
      }
    }),
});
