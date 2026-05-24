import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq, desc } from "drizzle-orm";
import { orders, users, products, notifications } from "../../drizzle/schema";

/**
 * Admin-only procedure that checks for admin role
 */
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can access this resource",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /**
   * Get dashboard statistics
   */
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    try {
      const totalOrders = await db.select().from(orders);
      const totalCustomers = await db.select().from(users);
      const totalProducts = await db.select().from(products);
      const pendingOrders = totalOrders.filter((o: any) => o.status === "pending");

      return {
        totalOrders: totalOrders.length,
        totalCustomers: totalCustomers.length,
        totalProducts: totalProducts.length,
        pendingOrders: pendingOrders.length,
      };
    } catch (error) {
      console.error("Failed to get dashboard stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get dashboard statistics",
      });
    }
  }),

  /**
   * Get all orders (with pagination)
   */
  getAllOrders: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const allOrders = await db
          .select()
          .from(orders)
          .orderBy(desc(orders.createdAt));

        const start = (input.page - 1) * input.limit;
        const end = start + input.limit;
        const paginatedOrders = allOrders.slice(start, end);

        return {
          orders: paginatedOrders,
          total: allOrders.length,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        console.error("Failed to get all orders:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get orders",
        });
      }
    }),

  /**
   * Update order status
   */
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["pending", "shipped", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        await db
          .update(orders)
          .set({ status: input.status as any })
          .where(eq(orders.id, input.orderId));

        return {
          success: true,
          message: `Order status updated to ${input.status}`,
        };
      } catch (error) {
        console.error("Failed to update order status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update order status",
        });
      }
    }),

  /**
   * Get all customers (with pagination)
   */
  getAllCustomers: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const allCustomers = await db
          .select()
          .from(users)
          .orderBy(desc(users.createdAt));

        const start = (input.page - 1) * input.limit;
        const end = start + input.limit;
        const paginatedCustomers = allCustomers.slice(start, end);

        return {
          customers: paginatedCustomers,
          total: allCustomers.length,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        console.error("Failed to get all customers:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get customers",
        });
      }
    }),

  /**
   * Get all products (with pagination)
   */
  getAllProducts: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const allProducts = await db
          .select()
          .from(products)
          .orderBy(desc(products.createdAt));

        const start = (input.page - 1) * input.limit;
        const end = start + input.limit;
        const paginatedProducts = allProducts.slice(start, end);

        return {
          products: paginatedProducts,
          total: allProducts.length,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        console.error("Failed to get all products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get products",
        });
      }
    }),

  /**
   * Update product stock
   */
  updateProductStock: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        stock: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        await db
          .update(products)
          .set({ stock: input.stock })
          .where(eq(products.id, input.productId));

        return {
          success: true,
          message: `Product stock updated to ${input.stock}`,
        };
      } catch (error) {
        console.error("Failed to update product stock:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product stock",
        });
      }
    }),

  /**
   * Send notification to customer
   */
  sendNotificationToCustomer: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        title: z.string(),
        content: z.string(),
        type: z.string().default("admin_message"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        await db.insert(notifications).values({
          userId: input.userId,
          type: input.type as any,
          title: input.title,
          content: input.content,
          isRead: false,
          createdAt: new Date(),
        });

        return {
          success: true,
          message: "Notification sent to customer",
        };
      } catch (error) {
        console.error("Failed to send notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send notification",
        });
      }
    }),
});
