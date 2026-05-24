# PharmaBridge - Technical Architecture & Implementation Blueprint

## Executive Summary

PharmaBridge is a comprehensive Japanese-market e-commerce and order management platform designed to automate the entire workflow of importing pharmaceutical and targeted drug products from Indian suppliers. The platform features an AI-powered Japanese chatbot, secure user authentication, product catalog management, real-time order tracking, automated logistics notifications, and role-based admin/supplier panels. This document outlines the complete technical architecture, database schema, API structure, and implementation roadmap.

---

## 1. System Architecture Overview

### 1.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS 4 | Japanese customer UI, admin dashboard, chatbot interface |
| **Backend** | Express 4 + tRPC 11 + Node.js | API gateway, business logic, LLM integration |
| **Database** | MySQL/TiDB | User data, products, orders, chat history, notifications |
| **Authentication** | Manus OAuth + JWT | Secure user authentication and session management |
| **LLM/AI** | Manus LLM API (Claude/GPT) | Japanese chatbot, product recommendations, order guidance |
| **File Storage** | AWS S3 (via Manus proxy) | Documents, invoices, shipping papers, product images |
| **Notifications** | Email + In-app system | Order lifecycle notifications at four key milestones |
| **Deployment** | Cloud Run (Node.js) | Production hosting with auto-scaling |

### 1.2 High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Japanese Customer                             │
│  (Web Browser / Mobile App)                                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │   React SPA     │
        │  (Chatbot UI,   │
        │  Product Catalog│
        │  Order Flow)    │
        └────────┬────────┘
                 │ tRPC / REST
        ┌────────▼──────────────────────┐
        │   Express Backend             │
        │  ├─ Auth Router               │
        │  ├─ Product Router            │
        │  ├─ Order Router              │
        │  ├─ Chat Router               │
        │  ├─ Notification Router       │
        │  └─ Admin Router              │
        └────────┬──────────────────────┘
                 │
     ┌───────────┼───────────┬──────────────┐
     │           │           │              │
┌────▼────┐ ┌────▼────┐ ┌───▼────┐ ┌──────▼──────┐
│ MySQL   │ │ S3      │ │ Manus  │ │ Email       │
│ Database│ │ Storage │ │ LLM    │ │ Service     │
└─────────┘ └─────────┘ └────────┘ └─────────────┘
```

---

## 2. Database Schema Design

### 2.1 Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  phone VARCHAR(20),
  address TEXT,
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin', 'supplier') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name_ja VARCHAR(255) NOT NULL,
  description_ja LONGTEXT,
  category ENUM('ED', 'AGA', 'cancer_targeted', 'other') NOT NULL,
  genericName VARCHAR(255),
  manufacturer VARCHAR(255),
  dosage VARCHAR(100),
  price DECIMAL(10, 2),
  stockLevel INT DEFAULT 0,
  supplierId INT,
  imageUrl VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplierId) REFERENCES suppliers(id)
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderNumber VARCHAR(50) UNIQUE NOT NULL,
  customerId INT NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped_india', 'customs_cleared', 'local_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
  totalAmount DECIMAL(10, 2),
  shippingAddress TEXT,
  trackingNumber VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deliveredAt TIMESTAMP NULL,
  FOREIGN KEY (customerId) REFERENCES users(id),
  INDEX idx_customerId (customerId),
  INDEX idx_status (status)
);
```

#### OrderItems Table
```sql
CREATE TABLE orderItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

#### ChatHistory Table
```sql
CREATE TABLE chatHistory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  conversationId VARCHAR(100),
  role ENUM('user', 'assistant', 'system') NOT NULL,
  message LONGTEXT NOT NULL,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_userId (userId),
  INDEX idx_conversationId (conversationId)
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  orderId INT,
  type ENUM('order_confirmed', 'shipped_india', 'customs_cleared', 'local_delivery', 'other') NOT NULL,
  title_ja VARCHAR(255),
  message_ja LONGTEXT,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  sentAt TIMESTAMP NULL,
  readAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (orderId) REFERENCES orders(id),
  INDEX idx_userId (userId),
  INDEX idx_status (status)
);
```

#### Documents Table
```sql
CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  documentType ENUM('invoice', 'shipping_label', 'customs_form', 'product_image', 'other') NOT NULL,
  fileName VARCHAR(255),
  fileKey VARCHAR(500),
  fileUrl VARCHAR(500),
  uploadedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (uploadedBy) REFERENCES users(id)
);
```

#### Suppliers Table
```sql
CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(255),
  email VARCHAR(320),
  phone VARCHAR(20),
  address TEXT,
  country VARCHAR(100),
  specialization VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### LocalDeliveryTeam Table
```sql
CREATE TABLE localDeliveryTeam (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(320),
  region VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### OrderStatusLog Table
```sql
CREATE TABLE orderStatusLog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  previousStatus VARCHAR(50),
  newStatus VARCHAR(50),
  updatedBy INT,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (updatedBy) REFERENCES users(id)
);
```

---

## 3. API Structure (tRPC Procedures)

### 3.1 Authentication Router
```typescript
auth.register()          // Customer registration
auth.login()             // Manus OAuth callback
auth.logout()            // Clear session
auth.me()                // Get current user profile
auth.updateProfile()     // Update user info (name, phone, address)
auth.getProfile(userId)  // Admin: Get user profile
```

### 3.2 Product Router
```typescript
products.list()                    // List all products with filters
products.getByCategory(category)   // Get products by category
products.getDetail(productId)      // Get product detail
products.search(query)             // Search products
products.getRecommendations()      // AI-powered recommendations (from chatbot)
admin.createProduct()              // Admin: Create product
admin.updateProduct()              // Admin: Update product
admin.deleteProduct()              // Admin: Delete product
admin.updateInventory()            // Admin: Update stock levels
```

### 3.3 Order Router
```typescript
orders.create(items, shippingAddress)    // Create new order
orders.list()                             // List user's orders
orders.getDetail(orderId)                 // Get order details
orders.cancel(orderId)                    // Cancel order (if pending)
orders.getStatusHistory(orderId)          // Get order status timeline
admin.listAllOrders()                     // Admin: List all orders
admin.updateOrderStatus()                 // Admin: Update order status (triggers notifications)
admin.assignToLocalTeam()                 // Admin: Assign to local delivery
localTeam.updateDeliveryStatus()          // Local team: Update final delivery status
```

### 3.4 Chat Router
```typescript
chat.sendMessage(message, conversationId)      // Send message to chatbot
chat.getChatHistory(conversationId)            // Retrieve chat history
chat.getConversations()                        // List user's conversations
chat.clearConversation(conversationId)         // Delete conversation
chat.getProductRecommendation(query)           // Get AI product recommendation
chat.getOrderGuidance(orderId)                 // Get order status from chatbot
```

### 3.5 Notification Router
```typescript
notifications.list()                   // Get user's notifications
notifications.markAsRead(notificationId)
notifications.getPreferences()         // Get notification settings
notifications.updatePreferences()      // Update notification settings
admin.sendManualNotification()         // Admin: Send custom notification
admin.testNotification()               // Admin: Test notification system
```

### 3.6 Document Router
```typescript
documents.uploadDocument(orderId, file, type)  // Upload document
documents.getOrderDocuments(orderId)           // Get all documents for order
documents.deleteDocument(documentId)           // Delete document (admin only)
documents.generatePresignedUrl(documentId)    // Get download URL
```

### 3.7 Admin Router
```typescript
admin.getDashboardStats()              // Dashboard overview
admin.getOrderAnalytics()              // Order analytics
admin.getCustomerAnalytics()           // Customer analytics
admin.getSupplierList()                // Manage suppliers
admin.createSupplier()                 // Add supplier
admin.updateSupplier()                 // Update supplier
admin.getLocalDeliveryTeam()           // Manage delivery team
admin.addDeliveryTeamMember()          // Add team member
```

---

## 4. Frontend Component Structure

### 4.1 Customer-Facing Pages
```
/                          → Home page with featured products & chatbot intro
/register                  → User registration
/login                     → Manus OAuth login
/profile                   → User profile management
/products                  → Product catalog with filters
/products/:id              → Product detail page
/orders                    → Order history
/orders/:id                → Order detail with status tracking
/chat                      → Chatbot interface (persistent)
/notifications             → Notification center
/settings                  → Notification preferences
```

### 4.2 Admin Pages
```
/admin/dashboard           → Overview & analytics
/admin/orders              → Order management
/admin/customers           → Customer management
/admin/products            → Product management
/admin/inventory           → Stock management
/admin/suppliers           → Supplier management
/admin/documents           → Document management
/admin/delivery-team       → Local delivery team management
/admin/notifications       → Notification management
```

### 4.3 Key Components
```
AIChatBox.tsx              → Persistent chatbot interface
ProductCard.tsx            → Product listing card
OrderStatusTimeline.tsx    → Order status visualization
OrderForm.tsx              → Order placement form
NotificationCenter.tsx     → Notification display
DocumentUpload.tsx         → File upload interface
AdminOrderTable.tsx        → Order management table
SupplierForm.tsx           → Supplier management form
```

---

## 5. AI Chatbot Integration Strategy

### 5.1 Chatbot Capabilities
The AI chatbot operates as a natural-language conversational agent in Japanese, capable of:

**Product Inquiry:** Customers ask about specific drugs, side effects, dosages, and availability. The chatbot retrieves product information from the database and provides detailed, medically accurate responses in Japanese.

**Product Recommendation:** Based on customer symptoms or conditions described in natural language, the chatbot recommends relevant products from the catalog (ED drugs, AGA treatments, cancer drugs, etc.).

**Order Guidance:** The chatbot guides customers through the entire order process, from product selection to payment, answering questions about shipping, customs, and delivery timelines.

**FAQ & Support:** The chatbot handles common questions about policies, shipping costs, payment methods, and return procedures.

**Order Status Inquiry:** Customers can ask about their order status in natural language, and the chatbot retrieves and explains the current status.

### 5.2 LLM Integration Implementation
```typescript
// server/routers/chat.ts
import { invokeLLM } from "./server/_core/llm";

export const chatRouter = router({
  sendMessage: protectedProcedure
    .input(z.object({ 
      message: z.string(), 
      conversationId: z.string().optional() 
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Retrieve chat history
      const history = await db.getChatHistory(ctx.user.id, input.conversationId);
      
      // 2. Prepare system prompt in Japanese
      const systemPrompt = `あなたは親切で知識豊富な医薬品カスタマーサービスアシスタントです。
日本の顧客をサポートしており、すべての応答は日本語で提供する必要があります。
顧客の質問に対して、正確で有用な情報を提供してください。
医学的なアドバイスは提供せず、製品情報のみを提供してください。`;
      
      // 3. Call LLM with conversation context
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map(h => ({ 
            role: h.role as "user" | "assistant", 
            content: h.message 
          })),
          { role: "user", content: input.message }
        ]
      });
      
      const assistantMessage = response.choices[0].message.content;
      
      // 4. Store conversation in database
      await db.saveChatMessage(ctx.user.id, input.conversationId, {
        role: "user",
        message: input.message
      });
      
      await db.saveChatMessage(ctx.user.id, input.conversationId, {
        role: "assistant",
        message: assistantMessage
      });
      
      return { message: assistantMessage };
    })
});
```

### 5.3 Product Recommendation Flow
```typescript
// Enhanced recommendation with product database context
export const getProductRecommendation = protectedProcedure
  .input(z.object({ query: z.string() }))
  .mutation(async ({ input }) => {
    // 1. Retrieve all products from database
    const products = await db.getAllProducts();
    
    // 2. Create product context for LLM
    const productContext = products.map(p => 
      `${p.name_ja} (${p.category}): ${p.description_ja}`
    ).join("\n");
    
    // 3. Call LLM with product catalog
    const response = await invokeLLM({
      messages: [
        { 
          role: "system", 
          content: `利用可能な製品カタログ:\n${productContext}\n\n顧客の質問に基づいて、最適な製品を推奨してください。` 
        },
        { role: "user", content: input.query }
      ]
    });
    
    return { recommendation: response.choices[0].message.content };
  });
```

---

## 6. Notification System Architecture

### 6.1 Four Key Logistics Milestones

| Milestone | Event | Trigger | Notification Content |
|-----------|-------|---------|----------------------|
| **1. Order Confirmed** | Admin confirms order receipt | Manual admin action | 「ご注文ありがとうございます。ご注文番号: #12345」 |
| **2. Shipped from India** | Order dispatched from supplier | Admin updates status or supplier API | 「インドから発送されました。追跡番号: XXXX」 |
| **3. Customs Cleared** | Package clears Japanese customs | Admin updates status | 「日本の税関を通過しました。」 |
| **4. Handed to Local Team** | Package handed to local delivery | Admin assigns to local team | 「ローカルチームに引き渡されました。配送予定日: XX月XX日」 |

### 6.2 Notification Trigger Implementation
```typescript
// server/routers/orders.ts
export const updateOrderStatus = adminProcedure
  .input(z.object({
    orderId: z.number(),
    newStatus: z.enum(['confirmed', 'shipped_india', 'customs_cleared', 'local_delivery', 'delivered'])
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Update order status in database
    const order = await db.updateOrderStatus(input.orderId, input.newStatus);
    
    // 2. Trigger notification based on status
    const notificationMap = {
      'confirmed': {
        type: 'order_confirmed',
        title_ja: 'ご注文確認',
        message_ja: `ご注文ありがとうございます。ご注文番号: #${order.orderNumber}`
      },
      'shipped_india': {
        type: 'shipped_india',
        title_ja: 'インドから発送',
        message_ja: `インドから発送されました。追跡番号: ${order.trackingNumber}`
      },
      'customs_cleared': {
        type: 'customs_cleared',
        title_ja: '税関通過',
        message_ja: '日本の税関を通過しました。'
      },
      'local_delivery': {
        type: 'local_delivery',
        title_ja: 'ローカルチームに引き渡し',
        message_ja: 'ローカルチームに引き渡されました。配送予定日: XX月XX日'
      }
    };
    
    const notification = notificationMap[input.newStatus];
    
    // 3. Save notification to database
    await db.createNotification({
      userId: order.customerId,
      orderId: input.orderId,
      type: notification.type,
      title_ja: notification.title_ja,
      message_ja: notification.message_ja
    });
    
    // 4. Send email notification
    await sendEmailNotification(order.customerId, notification);
    
    // 5. Log status change
    await db.logOrderStatusChange(input.orderId, order.status, input.newStatus, ctx.user.id);
    
    return { success: true };
  });

// Email notification helper
async function sendEmailNotification(userId: number, notification: any) {
  const user = await db.getUser(userId);
  // Use Manus email service or third-party email provider
  // Send email with notification.title_ja and notification.message_ja
}
```

### 6.3 Notification Preferences
Users can configure which notifications they receive via email, in-app, or both. Admins can test the notification system to ensure delivery at all milestones.

---

## 7. File Storage & Document Management

### 7.1 Document Types & Linking
Each order record is linked to multiple document types:

- **Invoice:** Original invoice from Indian supplier
- **Shipping Label:** Tracking and shipping documentation
- **Customs Form:** Japanese customs declaration
- **Product Images:** High-resolution product photos
- **Other:** Additional documents as needed

### 7.2 S3 Storage Implementation
```typescript
// server/storage.ts
import { storagePut, storageGet } from "./server/_core/storage";

export async function uploadOrderDocument(
  orderId: number,
  file: Buffer,
  fileName: string,
  documentType: string,
  uploadedBy: number
) {
  // 1. Upload file to S3
  const fileKey = `orders/${orderId}/${documentType}/${fileName}`;
  const { url, key } = await storagePut(fileKey, file, "application/octet-stream");
  
  // 2. Save document metadata to database
  await db.createDocument({
    orderId,
    documentType,
    fileName,
    fileKey: key,
    fileUrl: url,
    uploadedBy
  });
  
  return { url, key };
}

export async function getOrderDocuments(orderId: number) {
  const documents = await db.getDocumentsByOrderId(orderId);
  
  // Generate presigned URLs for secure download
  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => ({
      ...doc,
      downloadUrl: await storageGet(doc.fileKey, 3600) // 1 hour expiry
    }))
  );
  
  return documentsWithUrls;
}
```

---

## 8. Role-Based Access Control (RBAC)

### 8.1 User Roles

| Role | Permissions | Access |
|------|-------------|--------|
| **Customer** | Browse products, place orders, view own orders, chat with bot, manage profile | `/products`, `/orders`, `/chat`, `/profile` |
| **Admin** | Manage all orders, customers, products, inventory, suppliers, notifications | `/admin/*` |
| **Supplier** | View assigned products, update inventory, manage supplier documents | `/supplier/*` |
| **LocalDelivery** | Update final delivery status, view assigned orders | `/delivery/*` |

### 8.2 RBAC Implementation
```typescript
// server/_core/trpc.ts
import { TRPCError } from "@trpc/server";

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const supplierProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "supplier") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const localDeliveryProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "localDelivery") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});
```

---

## 9. Design System: Scandinavian Minimalist Aesthetic

### 9.1 Color Palette
- **Primary Background:** Pale cool gray (`#F5F7F9`)
- **Secondary Background:** Off-white (`#FAFBFC`)
- **Accent 1:** Soft pastel blue (`#B8D4E8`)
- **Accent 2:** Blush pink (`#F0D9E3`)
- **Text Primary:** Deep charcoal (`#1A1A1A`)
- **Text Secondary:** Medium gray (`#666666`)
- **Border:** Light gray (`#E0E0E0`)

### 9.2 Typography
- **Headings:** Bold, black sans-serif (e.g., `font-weight: 700`, `font-family: 'Inter', sans-serif`)
- **Subtitles:** Delicate thin sans-serif (e.g., `font-weight: 300`, `font-size: 0.875rem`)
- **Body:** Regular sans-serif (e.g., `font-weight: 400`, `font-size: 1rem`)

### 9.3 Spacing & Layout
- **Generous Negative Space:** Minimum padding 2rem between sections
- **Geometric Shapes:** Subtle circles and rectangles in soft pastels as decorative accents
- **Alignment:** Clean grid-based layout with clear visual hierarchy

### 9.4 Tailwind CSS Configuration
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'scandinavian-gray': '#F5F7F9',
        'scandinavian-white': '#FAFBFC',
        'scandinavian-blue': '#B8D4E8',
        'scandinavian-pink': '#F0D9E3',
        'scandinavian-charcoal': '#1A1A1A',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      spacing: {
        'generous': '2rem',
      }
    }
  }
};
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema creation and migration
- [ ] User authentication setup (Manus OAuth)
- [ ] Basic API structure (tRPC routers)
- [ ] Frontend layout and navigation

### Phase 2: Customer Features (Week 3-4)
- [ ] User registration and profile management
- [ ] Product catalog and search
- [ ] Order placement and management
- [ ] Chatbot UI integration

### Phase 3: Backend Automation (Week 5-6)
- [ ] Order status workflow
- [ ] Notification system (email + in-app)
- [ ] LLM chatbot integration
- [ ] Document storage and linking

### Phase 4: Admin & Supplier (Week 7-8)
- [ ] Admin dashboard
- [ ] Supplier management panel
- [ ] Local delivery team interface
- [ ] Analytics and reporting

### Phase 5: Testing & Deployment (Week 9-10)
- [ ] Unit and integration tests
- [ ] Security audit and optimization
- [ ] User acceptance testing
- [ ] Production deployment

---

## 11. Security Considerations

**Authentication:** All API endpoints require Manus OAuth authentication. Session cookies are secure, HTTP-only, and SameSite-protected.

**Authorization:** Role-based access control enforces strict separation between customer, admin, supplier, and local delivery interfaces.

**File Storage:** Documents are stored in S3 with presigned URLs that expire after 1 hour. File access is logged and auditable.

**Data Encryption:** Sensitive data (addresses, phone numbers) is encrypted at rest. All API traffic uses HTTPS.

**Input Validation:** All user inputs are validated using Zod schemas before processing.

---

## 12. Monitoring & Logging

**Application Logs:** All API calls, errors, and status changes are logged to `.manus-logs/`.

**Notification Logs:** Each notification delivery is logged with timestamp, recipient, and delivery status.

**Order Audit Trail:** Every order status change is recorded in `orderStatusLog` table with user and timestamp.

**Performance Monitoring:** Database query performance and API response times are monitored.

---

## Conclusion

PharmaBridge is architected as a scalable, secure, and user-friendly platform that automates the entire workflow of importing pharmaceutical products from India to Japan. The integration of AI-powered chatbot, automated notifications, and role-based access control ensures a seamless experience for customers, admins, suppliers, and local delivery teams. The Scandinavian minimalist design aesthetic provides a modern, professional appearance that builds trust with Japanese customers.

---

**Document Version:** 1.0  
**Last Updated:** May 17, 2026  
**Author:** Manus AI
