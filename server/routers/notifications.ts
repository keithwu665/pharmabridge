import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { createNotification, getUserNotifications, markNotificationAsRead } from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Four logistics milestones for automatic notifications
 */
export enum LogisticsMilestone {
  ORDER_CONFIRMED = "order_confirmed",
  SHIPPED_FROM_INDIA = "shipped_from_india",
  CLEARED_JAPANESE_CUSTOMS = "cleared_japanese_customs",
  HANDED_TO_LOCAL_TEAM = "handed_to_local_team",
}

/**
 * Notification templates for each milestone (in Japanese)
 */
const NOTIFICATION_TEMPLATES = {
  [LogisticsMilestone.ORDER_CONFIRMED]: {
    title: "ご注文確認",
    content: "ご注文ありがとうございます。ご注文が確認されました。",
  },
  [LogisticsMilestone.SHIPPED_FROM_INDIA]: {
    title: "インドから発送されました",
    content: "ご注文の商品がインドから発送されました。配送番号をご確認ください。",
  },
  [LogisticsMilestone.CLEARED_JAPANESE_CUSTOMS]: {
    title: "日本の税関をクリアしました",
    content: "ご注文の商品が日本の税関をクリアしました。もうすぐお届けします。",
  },
  [LogisticsMilestone.HANDED_TO_LOCAL_TEAM]: {
    title: "ローカルチームに引き渡されました",
    content: "ご注文の商品がローカルチームに引き渡されました。本日中にお届けします。",
  },
};

export const notificationsRouter = router({
  /**
   * Get user notifications
   */
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    try {
      const notifications = await getUserNotifications(ctx.user.id);
      return notifications;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch notifications",
      });
    }
  }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await markNotificationAsRead(input.notificationId);
        return {
          success: true,
          message: "Notification marked as read",
        };
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notification as read",
        });
      }
    }),

  /**
   * Trigger a logistics milestone notification
   * This is called by the admin or automated system
   */
  triggerMilestoneNotification: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        orderId: z.number(),
        milestone: z.enum([
          LogisticsMilestone.ORDER_CONFIRMED,
          LogisticsMilestone.SHIPPED_FROM_INDIA,
          LogisticsMilestone.CLEARED_JAPANESE_CUSTOMS,
          LogisticsMilestone.HANDED_TO_LOCAL_TEAM,
        ]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const template = NOTIFICATION_TEMPLATES[input.milestone];

        if (!template) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid milestone",
          });
        }

        await createNotification(
          input.userId,
          input.milestone,
          template.title,
          template.content,
          input.orderId
        );

        return {
          success: true,
          message: `Milestone notification triggered: ${input.milestone}`,
        };
      } catch (error) {
        console.error("Failed to trigger milestone notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to trigger milestone notification",
        });
      }
    }),

  /**
   * Get notification count for unread notifications
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      const notifications = await getUserNotifications(ctx.user.id);
      const unreadCount = notifications.filter((n: any) => !n.isRead).length;
      return {
        unreadCount,
      };
    } catch (error) {
      console.error("Failed to get unread count:", error);
      return {
        unreadCount: 0,
      };
    }
  }),
});
