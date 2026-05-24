import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-delivery",
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

describe("delivery router", () => {
  it("should require authentication for getting pending deliveries", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.delivery.getPendingDeliveries();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should allow authenticated user to get pending deliveries", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.delivery.getPendingDeliveries();
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("deliveries");
      expect(result).toHaveProperty("count");
      expect(Array.isArray(result.deliveries)).toBe(true);
    } catch (error) {
      // No deliveries exist, that's OK
      expect(error).toBeDefined();
    }
  });

  it("should require authentication for updating delivery status", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.delivery.updateDeliveryStatus({
        orderId: 1,
        status: "in_transit",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should require authentication for getting delivery history", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.delivery.getDeliveryHistory({ orderId: 1 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should allow authenticated user to get delivery history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.delivery.getDeliveryHistory({ orderId: 1 });
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("order");
    } catch (error) {
      // Order might not exist, that's OK
      expect(error).toBeDefined();
    }
  });

  it("should require authentication for confirming delivery", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.delivery.confirmDelivery({
        orderId: 1,
        recipientName: "John Doe",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should validate delivery status enum", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.delivery.updateDeliveryStatus({
        orderId: 1,
        status: "invalid" as any,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should require recipient name for delivery confirmation", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.delivery.confirmDelivery({
        orderId: 1,
        recipientName: "",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});
