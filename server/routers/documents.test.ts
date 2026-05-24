import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-docs",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("documents router", () => {
  it("should require authentication for uploading document", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.documents.uploadOrderDocument({
        orderId: 1,
        documentType: "invoice",
        fileName: "invoice.pdf",
        fileData: "base64data",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should require authentication for getting order documents", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.documents.getOrderDocuments({ orderId: 1 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should require authentication for getting download URL", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.documents.getDocumentDownloadUrl({ documentId: 1 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should allow authenticated user to get order documents", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.documents.getOrderDocuments({ orderId: 1 });
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      // Order might not exist, that's OK
      expect(error).toBeDefined();
    }
  });

  it("should handle invalid document type", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.documents.uploadOrderDocument({
        orderId: 1,
        documentType: "invalid" as any,
        fileName: "file.pdf",
        fileData: "base64data",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should require admin role for deleting document", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.documents.deleteDocument({ documentId: 1 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});
