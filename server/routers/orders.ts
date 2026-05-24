import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { createOrder, getUserOrders, getOrderById, updateOrderStatus, getProductById, createNotification } from "../db";
import { TRPCError } from "@trpc/server";

export const ordersRouter = router({
  /**
   * Create a new order
   */
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        shippingAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const product = await getProductById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const totalPrice = (Number(product.price) * input.quantity).toString();

        const result = await createOrder(
          ctx.user.id,
          input.productId,
          input.quantity,
          totalPrice,
          input.shippingAddress || ctx.user.email || ""
        );

        const orderId = (result as any).insertId || Date.now();

        await createNotification(
          ctx.user.id,
          "order_confirmed",
          "Order Confirmed",
          `Order #${orderId}`,
          orderId as number
        );

        return {
          success: true,
          orderId,
          message: "Order created successfully",
        };
      } catch (error) {
        console.error("Failed to create order:", error);
        throw error;
      }
    }),

  /**
   * List user's orders
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userOrders = await getUserOrders(ctx.user.id);
      return userOrders;
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      return [];
    }
  }),

  /**
   * Get order detail
   */
  getDetail: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const order = await getOrderById(input.id);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        return order;
      } catch (error) {
        console.error("Failed to fetch order detail:", error);
        throw error;
      }
    }),

  /**
   * Cancel order (only if pending)
   */
  cancel: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const order = await getOrderById(input.id);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        if (order.status !== "pending") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot cancel this order",
          });
        }

        await updateOrderStatus(input.id, "cancelled");

        return {
          success: true,
          message: "Order cancelled",
        };
      } catch (error) {
        console.error("Failed to cancel order:", error);
        throw error;
      }
    }),

  /**
   * Get order status history
   */
  getStatusHistory: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const order = await getOrderById(input.id);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        const statuses = [
          { status: "pending", label: "Pending", timestamp: order.createdAt },
          { status: "confirmed", label: "Confirmed", timestamp: order.updatedAt },
          { status: "shipped_from_india", label: "Shipped from India", timestamp: null },
          { status: "customs_cleared", label: "Customs Cleared", timestamp: null },
          { status: "handed_to_local_team", label: "Handed to Local Team", timestamp: null },
          { status: "delivered", label: "Delivered", timestamp: null },
        ];

        return statuses.filter((s) => {
          const statusOrder = [
            "pending",
            "confirmed",
            "shipped_from_india",
            "customs_cleared",
            "handed_to_local_team",
            "delivered",
          ];
          const currentIndex = statusOrder.indexOf(order.status);
          const statusIndex = statusOrder.indexOf(s.status);
          return statusIndex <= currentIndex;
        });
      } catch (error) {
        console.error("Failed to fetch status history:", error);
        throw error;
      }
    }),
});
