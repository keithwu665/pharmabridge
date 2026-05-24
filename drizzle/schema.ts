import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table - Pharmaceutical products from Indian suppliers
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name_ja: varchar("name_ja", { length: 255 }).notNull(),
  name_en: varchar("name_en", { length: 255 }),
  genericName: varchar("genericName", { length: 255 }),
  category: mysqlEnum("category", ["ED", "AGA", "cancer_targeted", "other"]).notNull(),
  description: text("description"),
  dosage: varchar("dosage", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  stockLevel: int("stockLevel").default(0),
  imageUrl: varchar("imageUrl", { length: 500 }),
  specifications: text("specifications"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders table - Customer orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "shipped_from_india",
    "customs_cleared",
    "handed_to_local_team",
    "delivered",
    "cancelled",
  ])
    .notNull()
    .default("pending"),
  shippingAddress: text("shippingAddress"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Chat messages table - Store chat history per user
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationId: varchar("conversationId", { length: 100 }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Notifications table - Order status notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: int("orderId"),
  type: mysqlEnum("type", [
    "order_confirmed",
    "shipped_from_india",
    "customs_cleared",
    "handed_to_local_team",
    "delivered",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  isRead: boolean("isRead").default(false),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Documents table - Invoices, shipping documents, product images
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId"),
  productId: int("productId"),
  type: mysqlEnum("type", ["invoice", "shipping_document", "product_image", "other"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Suppliers table - Indian pharmaceutical suppliers
 */
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("India"),
  contactPerson: varchar("contactPerson", { length: 255 }),
  notes: text("notes"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * Order status history - Track order lifecycle
 */
export const orderStatusHistory = mysqlTable("orderStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "shipped_from_india",
    "customs_cleared",
    "handed_to_local_team",
    "delivered",
    "cancelled",
  ]).notNull(),
  notes: text("notes"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = typeof orderStatusHistory.$inferInsert;