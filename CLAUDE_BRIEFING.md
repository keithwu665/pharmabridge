# PharmaBridge - Claude 工作簡報

**致 Claude：** 以下是您在 PharmaBridge 項目中的具體任務、要求和交付物清單。

---

## 項目概述

PharmaBridge 是一個日本市場的電商和訂單管理平台，用於從印度供應商進口藥品和靶向藥物。該平台具有 AI 驅動的日文聊天機器人、安全的用戶認證、產品目錄、實時訂單跟蹤、自動化物流通知和角色型管理面板。

**技術棧：** React 19 + TypeScript + Tailwind CSS 4 + Express 4 + tRPC 11 + MySQL

**設計風格：** 斯堪的納維亞極簡主義（淡灰色背景、黑色粗體標題、柔和藍粉色裝飾元素）

**語言要求：** 所有客戶面向的文本、聊天機器人回應和 UI 標籤必須是日文

---

## 您的角色與責任

### 核心職責
- 🔹 生成高質量的 React 組件代碼
- 🔹 編寫 tRPC 路由器和業務邏輯
- 🔹 設計 AI 聊天機器人的系統 prompt（日文）
- 🔹 實現通知系統和郵件模板
- 🔹 提供多個設計方案供選擇
- 🔹 快速迭代和調整代碼

### 與 Manus 的協作
- Manus 將您的代碼集成到項目中
- Manus 在沙箱中執行測試並報告結果
- 您根據測試反饋調整代碼
- Manus 最終驗證並優化

---

## 代碼生成要求

### 文件結構與命名
- **前端組件：** `client/src/components/` 或 `client/src/pages/`
- **後端路由器：** `server/routers/` 或 `server/routers/<feature>.ts`
- **命名約定：** 使用 camelCase for variables/functions, PascalCase for components
- **文件擴展名：** `.tsx` for React components, `.ts` for utilities

### 代碼質量標準
- 使用 TypeScript 進行完整的類型安全
- 添加清晰的註釋和文檔字符串
- 遵循 ESLint 和 Prettier 的格式標準
- 使用 Zod 進行輸入驗證
- 實現適當的錯誤處理

### 日文本地化
- 所有用戶面向的文本使用日文
- 使用自然、專業的日文表達
- 提供英文註釋以便代碼理解
- 醫學術語使用標準日文表達

### 代碼交付格式
生成代碼時，請使用以下格式：

```markdown
## 文件：client/src/pages/LoginPage.tsx

\`\`\`typescript
// 完整的代碼內容
\`\`\`

**說明：**
- 簡要描述此文件的目的
- 關鍵實現細節
- 與其他組件的依賴關係
```

---

## 第一週任務：前端基礎（優先級順序）

### 任務 1：登錄頁面 (LoginPage.tsx)
**要求：**
- 集成 Manus OAuth 登錄流程
- 顯示「PharmaBridge」品牌和日文歡迎文本
- 實現「ログイン」（登錄）按鈕
- 使用 Scandinavian 設計風格（淡灰色背景、簡潔佈局）
- 添加品牌標誌和簡短的價值主張文本

**組件需求：**
- 使用 `useAuth()` hook 獲取登錄 URL
- 使用 shadcn/ui Button 組件
- 響應式設計（移動和桌面）
- 加載狀態指示器

**交付物：**
- LoginPage.tsx
- 相關的 CSS/Tailwind 類

---

### 任務 2：用戶註冊頁面 (RegisterPage.tsx)
**要求：**
- 用戶註冊表單（姓名、郵箱、電話、地址）
- 日文表單標籤和占位符文本
- 表單驗證（郵箱格式、電話號碼）
- 提交後的成功消息

**組件需求：**
- 使用 react-hook-form + Zod 進行驗證
- 使用 shadcn/ui Form 組件
- 錯誤消息顯示
- 加載和提交狀態

**交付物：**
- RegisterPage.tsx
- 表單驗證 schema

---

### 任務 3：用戶個人檔案頁面 (ProfilePage.tsx)
**要求：**
- 顯示和編輯用戶信息（姓名、郵箱、電話、地址）
- 個人檔案圖片上傳
- 保存按鈕和成功通知

**組件需求：**
- 使用 trpc.auth.updateProfile.useMutation()
- 編輯/查看模式切換
- 圖片預覽
- 加載和保存狀態

**交付物：**
- ProfilePage.tsx
- 個人檔案編輯表單組件

---

### 任務 4：產品列表頁面 (ProductsPage.tsx)
**要求：**
- 顯示所有產品的網格列表
- 按類別過濾（ED、AGA、癌症靶向藥、其他）
- 搜索功能
- 產品卡片顯示（名稱、類別、價格、圖片）

**組件需求：**
- 使用 trpc.products.list.useQuery()
- 過濾和搜索狀態管理
- 分頁或無限滾動
- 加載骨架屏

**交付物：**
- ProductsPage.tsx
- ProductCard.tsx
- ProductFilter.tsx

---

### 任務 5：產品詳情頁面 (ProductDetailPage.tsx)
**要求：**
- 顯示完整的產品信息（名稱、描述、劑量、製造商、價格）
- 產品圖片庫
- 「加入購物車」或「立即訂購」按鈕
- 相關產品推薦

**組件需求：**
- 使用 trpc.products.getDetail.useQuery()
- 圖片輪播
- 規格表格
- 評論/評分部分（可選）

**交付物：**
- ProductDetailPage.tsx
- ImageGallery.tsx
- ProductSpecs.tsx

---

### 任務 6：儀表板佈局 (DashboardLayout.tsx)
**要求：**
- 側邊欄導航（已有模板，但需要自定義）
- 頂部導航欄（用戶菜單、通知、登出）
- 麵包屑導航
- 響應式設計

**組件需求：**
- 使用現有的 DashboardLayout 組件作為參考
- 自定義導航項目
- 用戶菜單下拉
- 通知鈴鐺圖標

**交付物：**
- 更新的 DashboardLayout.tsx（如需要）
- 導航組件

---

### 任務 7：聊天機器人 UI (ChatBox.tsx)
**要求：**
- 聊天界面（消息列表、輸入框）
- 消息氣泡（用戶 vs 助手）
- 加載指示器（助手正在輸入）
- 聊天歷史滾動

**組件需求：**
- 使用 trpc.chat.sendMessage.useMutation()
- 消息格式化（支持 Markdown）
- 自動滾動到最新消息
- 清除聊天歷史按鈕

**交付物：**
- ChatBox.tsx（更新版本）
- MessageBubble.tsx
- ChatInput.tsx

---

## 第二週任務：後端 API（優先級順序）

### 任務 8：認證路由器 (auth.ts)
**要求：**
- 用戶註冊程序
- 用戶登錄程序
- 獲取當前用戶信息
- 更新用戶檔案
- 登出程序

**API 程序：**
```typescript
auth.register()           // 新用戶註冊
auth.login()              // Manus OAuth 回調
auth.me()                 // 獲取當前用戶
auth.updateProfile()      // 更新用戶信息
auth.logout()             // 登出（已有）
```

**交付物：**
- auth.ts 路由器代碼

---

### 任務 9：產品路由器 (products.ts)
**要求：**
- 列出所有產品（帶過濾）
- 按類別獲取產品
- 獲取產品詳情
- 搜索產品
- 獲取 AI 推薦產品

**API 程序：**
```typescript
products.list()                    // 列出所有產品
products.getByCategory()           // 按類別篩選
products.getDetail()               // 產品詳情
products.search()                  // 搜索
products.getRecommendations()      // AI 推薦
```

**交付物：**
- products.ts 路由器代碼

---

### 任務 10：訂單路由器 (orders.ts)
**要求：**
- 創建新訂單
- 列出用戶訂單
- 獲取訂單詳情
- 取消訂單（如果待處理）
- 獲取訂單狀態歷史

**API 程序：**
```typescript
orders.create()                    // 創建訂單
orders.list()                      // 列出用戶訂單
orders.getDetail()                 // 訂單詳情
orders.cancel()                    // 取消訂單
orders.getStatusHistory()          // 狀態時間線
```

**交付物：**
- orders.ts 路由器代碼

---

### 任務 11：聊天路由器 (chat.ts)
**要求：**
- 發送聊天消息（調用 LLM）
- 獲取聊天歷史
- 列出用戶對話
- 清除對話
- 獲取產品推薦

**API 程序：**
```typescript
chat.sendMessage()                 // 發送消息
chat.getChatHistory()              // 獲取歷史
chat.getConversations()            // 列出對話
chat.clearConversation()           // 清除對話
chat.getProductRecommendation()    // 產品推薦
```

**交付物：**
- chat.ts 路由器代碼
- 日文系統 prompt

---

### 任務 12：通知路由器 (notifications.ts)
**要求：**
- 列出用戶通知
- 標記通知為已讀
- 獲取通知偏好
- 更新通知偏好

**API 程序：**
```typescript
notifications.list()               // 列出通知
notifications.markAsRead()         // 標記已讀
notifications.getPreferences()     // 獲取偏好
notifications.updatePreferences()  // 更新偏好
```

**交付物：**
- notifications.ts 路由器代碼

---

## 第三週任務：AI 聊天機器人

### 任務 13：聊天機器人系統 Prompt（日文）
**要求：**
- 設計一個專業的日文系統 prompt
- 定義聊天機器人的角色和責任
- 包括產品知識、推薦邏輯、訂單指導
- 設置邊界和安全措施

**Prompt 應包括：**
- 角色定義（醫藥品客戶服務助手）
- 語言和語氣（專業、友好、日文）
- 能力（產品查詢、推薦、訂單幫助）
- 限制（不提供醫學建議）
- 上下文使用（產品目錄、用戶歷史）

**交付物：**
- 完整的日文系統 prompt（500-1000 字）
- 英文註釋說明邏輯

---

### 任務 14：聊天機器人集成代碼
**要求：**
- 實現 LLM 調用邏輯
- 處理多輪對話上下文
- 管理聊天歷史
- 實現錯誤處理和重試

**代碼需求：**
- 使用 `invokeLLM()` 助手
- 構建消息歷史數組
- 實現上下文窗口管理
- 添加日文回應驗證

**交付物：**
- chat.ts 中的 LLM 集成代碼

---

## 第四週任務：通知系統

### 任務 15：通知系統設計
**要求：**
- 設計四個里程碑的通知內容（日文）
- 定義郵件和應用內通知的模板
- 實現通知觸發邏輯

**四個里程碑：**
1. **訂單確認**：「ご注文ありがとうございます。ご注文番号: #12345」
2. **印度發貨**：「インドから発送されました。追跡番号: XXXX」
3. **海關清關**：「日本の税関を通過しました。」
4. **本地交付**：「ローカルチームに引き渡されました。配送予定日: XX月XX日」

**交付物：**
- 通知內容模板（日文）
- 通知觸發邏輯代碼

---

### 任務 16：郵件模板
**要求：**
- 設計 HTML 郵件模板
- 包括訂單詳情、狀態、追蹤鏈接
- 響應式設計
- 日文內容

**交付物：**
- HTML 郵件模板
- 模板變量說明

---

## 第五週任務：管理員面板

### 任務 17：管理員儀表板 (AdminDashboard.tsx)
**要求：**
- 顯示關鍵指標（訂單數、客戶數、收入）
- 最近訂單列表
- 圖表和分析

**交付物：**
- AdminDashboard.tsx
- 統計卡片組件

---

### 任務 18：訂單管理頁面 (AdminOrders.tsx)
**要求：**
- 列出所有訂單（帶過濾和排序）
- 訂單詳情視圖
- 狀態更新功能
- 批量操作

**交付物：**
- AdminOrders.tsx
- OrderTable.tsx
- OrderDetailModal.tsx

---

### 任務 19：客戶管理頁面 (AdminCustomers.tsx)
**要求：**
- 列出所有客戶
- 客戶詳情視圖
- 客戶通信工具

**交付物：**
- AdminCustomers.tsx
- CustomerTable.tsx

---

### 任務 20：產品管理頁面 (AdminProducts.tsx)
**要求：**
- 列出所有產品
- 創建/編輯產品
- 庫存管理
- 產品圖片上傳

**交付物：**
- AdminProducts.tsx
- ProductForm.tsx
- InventoryManager.tsx

---

### 任務 21：供應商管理頁面 (AdminSuppliers.tsx)
**要求：**
- 列出供應商
- 創建/編輯供應商
- 聯絡信息管理

**交付物：**
- AdminSuppliers.tsx
- SupplierForm.tsx

---

## 代碼交付檢查清單

在提交每個代碼文件時，請確保：

- [ ] 使用 TypeScript 進行完整的類型安全
- [ ] 添加清晰的註釋和文檔字符串
- [ ] 使用 Zod 進行輸入驗證
- [ ] 實現適當的錯誤處理
- [ ] 所有用戶面向文本都是日文
- [ ] 遵循 Tailwind CSS 最佳實踐
- [ ] 使用 shadcn/ui 組件
- [ ] 響應式設計（移動和桌面）
- [ ] 包括加載和錯誤狀態
- [ ] 提供清晰的代碼說明

---

## 與 Manus 的協作流程

### 代碼提交流程
1. 您提供完整的代碼片段（使用上述格式）
2. Manus 將代碼集成到項目中
3. Manus 在沙箱中測試並報告結果
4. 如有問題，Manus 提供具體的錯誤信息
5. 您根據反饋調整代碼
6. 重複直到測試通過

### 溝通方式
- 清晰的代碼說明
- 具體的文件路徑和命名
- 依賴關係和導入說明
- 測試用例建議

---

## 設計系統參考

### 顏色
- **主背景**：淡灰色 (#F5F7F9)
- **次背景**：米白色 (#FAFBFC)
- **藍色重點**：柔和藍 (#B8D4E8)
- **粉色重點**：腮紅粉 (#F0D9E3)
- **文本主色**：深炭灰 (#1A1A1A)
- **文本次色**：中灰 (#666666)

### 排版
- **標題**：粗體黑色無襯線字體（font-weight: 700）
- **副標題**：纖細無襯線字體（font-weight: 300）
- **正文**：常規無襯線字體（font-weight: 400）

### 組件
- 使用 shadcn/ui 組件庫
- 使用 Tailwind CSS 進行樣式
- 添加幾何形狀裝飾（圓形、矩形）

---

## 優先級和時間表

| 週 | 任務 | 優先級 | 交付物數量 |
|----|------|--------|---------|
| 1 | 前端基礎 | 🔴 高 | 7 個組件 |
| 2 | 後端 API | 🔴 高 | 6 個路由器 |
| 3 | 聊天機器人 | 🟠 中 | 2 個文件 |
| 4 | 通知系統 | 🟠 中 | 2 個文件 |
| 5 | 管理員面板 | 🟡 低 | 5 個組件 |

---

## 常見問題

**Q: 我應該使用什麼樣的代碼風格？**
A: 遵循 TypeScript 最佳實踐、使用 camelCase/PascalCase、添加清晰的註釋、使用 Zod 進行驗證。

**Q: 如何處理日文本地化？**
A: 所有用戶面向文本使用日文，代碼註釋使用英文。使用自然、專業的日文表達。

**Q: 我應該包括測試嗎？**
A: 不需要，Manus 會編寫 Vitest 測試。您只需提供高質量的代碼。

**Q: 如何處理錯誤？**
A: 使用 try-catch 塊、返回有意義的錯誤消息、使用 Zod 進行輸入驗證。

**Q: 我可以提供多個設計方案嗎？**
A: 可以！提供 2-3 個不同的實現方案供選擇。

---

## 下一步

1. 確認您理解了任務和要求
2. 開始第一週的任務（登錄、註冊、個人檔案、產品列表等）
3. 按照指定的代碼交付格式提供代碼
4. 等待 Manus 的集成和測試反饋
5. 根據反饋進行調整

---

**準備好開始了嗎？請從第一週的任務開始！**

---

**文檔版本：** 1.0  
**最後更新：** 2026 年 5 月 17 日  
**項目：** PharmaBridge  
**協作者：** Claude + Manus
