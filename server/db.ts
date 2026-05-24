import { eq, like, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, orders, chatMessages, notifications, documents } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Product queries
 */
export async function getProducts(category?: string, search?: string) {
  const db = await getDb();
  if (!db) return [];
  let query: any = db.select().from(products);
  const conditions: any[] = [];
  if (category) {
    conditions.push(eq(products.category, category as any));
  }
  if (search) {
    conditions.push(like(products.name_ja, `%${search}%`));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return await query;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Order queries
 */
export async function createOrder(userId: number, productId: number, quantity: number, totalPrice: string, shippingAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values({
    userId,
    productId,
    quantity,
    totalPrice: totalPrice as any,
    shippingAddress,
  });

  return result;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

/**
 * Chat queries
 */
export async function saveChatMessage(userId: number, role: "user" | "assistant", content: string, conversationId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(chatMessages).values({
    userId,
    role,
    content,
    conversationId: conversationId || `conv-${userId}-${Date.now()}`,
  });
}

export async function getChatHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(chatMessages.createdAt)
    .limit(limit);
}

/**
 * Notification queries
 */
export async function createNotification(
  userId: number,
  type: string,
  title: string,
  content?: string,
  orderId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(notifications).values({
    userId,
    type: type as any,
    title,
    content,
    orderId,
  });
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}

/**
 * Document queries
 */
export async function saveDocument(
  type: string,
  fileName: string,
  fileUrl: string,
  fileKey?: string,
  mimeType?: string,
  fileSize?: number,
  orderId?: number,
  productId?: number,
  uploadedBy?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(documents).values({
    type: type as any,
    fileName,
    fileUrl,
    fileKey,
    mimeType,
    fileSize,
    orderId,
    productId,
    uploadedBy,
  });
}

export async function getOrderDocuments(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(documents).where(eq(documents.orderId, orderId));
}
