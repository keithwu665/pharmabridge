import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { documents, orders } from "../../drizzle/schema";
import { storagePut, storageGet } from "../storage";

export const documentsRouter = router({
  /**
   * Upload a document for an order
   */
  uploadOrderDocument: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        documentType: z.enum(["invoice", "shipping_document", "product_image", "other"]),
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded file data
        mimeType: z.string().default("application/octet-stream"),
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
        // Verify user owns this order
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

        if (order[0].userId !== ctx.user?.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to upload documents for this order",
          });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(input.fileData, "base64");

        // Upload to storage
        const fileKey = `orders/${input.orderId}/${input.documentType}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Save document metadata to database
        await db.insert(documents).values({
          type: input.documentType as any,
          fileName: input.fileName,
          fileUrl: url,
          fileKey: fileKey,
          mimeType: input.mimeType,
          fileSize: buffer.length,
          orderId: input.orderId,
          uploadedBy: ctx.user?.id,
        });

        return {
          success: true,
          message: "Document uploaded successfully",
          fileUrl: url,
          fileKey: fileKey,
        };
      } catch (error) {
        console.error("Failed to upload document:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload document",
        });
      }
    }),

  /**
   * Get all documents for an order
   */
  getOrderDocuments: protectedProcedure
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
        // Verify user owns this order
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

        if (order[0].userId !== ctx.user?.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to access documents for this order",
          });
        }

        const orderDocuments = await db
          .select()
          .from(documents)
          .where(eq(documents.orderId, input.orderId));

        return orderDocuments;
      } catch (error) {
        console.error("Failed to get order documents:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get order documents",
        });
      }
    }),

  /**
   * Get a presigned download URL for a document
   */
  getDocumentDownloadUrl: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const doc = await db
          .select()
          .from(documents)
          .where(eq(documents.id, input.documentId))
          .limit(1);

        if (!doc || doc.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Verify user owns the order
        const order = await db
          .select()
          .from(orders)
          .where(eq(orders.id, doc[0].orderId!))
          .limit(1);

        if (!order || order.length === 0 || order[0].userId !== ctx.user?.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to download this document",
          });
        }

        // Get presigned URL
        const { url } = await storageGet(doc[0].fileKey!);

        return {
          success: true,
          downloadUrl: url,
          fileName: doc[0].fileName,
        };
      } catch (error) {
        console.error("Failed to get download URL:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get download URL",
        });
      }
    }),

  /**
   * Delete a document (admin only)
   */
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete documents",
          });
        }

        const doc = await db
          .select()
          .from(documents)
          .where(eq(documents.id, input.documentId))
          .limit(1);

        if (!doc || doc.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Delete from database (file in S3 will be orphaned but unreachable)
        await db.delete(documents).where(eq(documents.id, input.documentId));

        return {
          success: true,
          message: "Document deleted successfully",
        };
      } catch (error) {
        console.error("Failed to delete document:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete document",
        });
      }
    }),
});
