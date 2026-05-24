import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { saveChatMessage, getChatHistory } from "../db";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

/**
 * Japanese system prompt for the chatbot
 */
const JAPANESE_SYSTEM_PROMPT = `あなたはPharmaBridgeのカスタマーサポートAIアシスタントです。
日本の顧客がインドから輸入した医薬品に関する質問をサポートします。

重要な指示：
1. 常に日本語で、プロフェッショナルで親切な口調で応答してください
2. 製品の問い合わせ、推奨、注文サポート、配送に関する質問に対応できます
3. 医学的なアドバイスは提供しないでください。必ずヘルスケア専門家に相談することをお勧めします
4. ユーザーが製品情報を求めている場合は、具体的な製品名、価格、効能を提供してください
5. 注文プロセスについて質問がある場合は、ステップバイステップで説明してください
6. 配送に関する質問には、インドから日本への配送時間（通常7-14営業日）について説明してください
7. ユーザーが不安や懸念を表明した場合は、共感的に対応し、適切な情報を提供してください
8. 常に敬語を使用し、顧客を尊重してください
9. 質問に答えられない場合は、正直に認め、カスタマーサポートチームに連絡することをお勧めします
10. 日本の法律と医薬品の規制に関する知識を持ってください`;

export const chatRouter = router({
  /**
   * Send a message to the chatbot
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        conversationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const conversationId = input.conversationId || `conv-${ctx.user.id}-${Date.now()}`;
        await saveChatMessage(ctx.user.id, "user", input.content, conversationId);

        const history = await getChatHistory(ctx.user.id, 10);

        const messages: any[] = [
          {
            role: "system",
            content: JAPANESE_SYSTEM_PROMPT,
          },
          ...history.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user",
            content: input.content,
          },
        ];

        const response = await invokeLLM({
          messages,
        });

        const assistantMessageContent = response.choices[0]?.message?.content;
        const assistantMessage = typeof assistantMessageContent === "string" ? assistantMessageContent : "Unable to generate response";

        await saveChatMessage(ctx.user.id, "assistant", assistantMessage, conversationId);

        return {
          content: assistantMessage,
          conversationId,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Failed to send chat message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    }),

  /**
   * Get chat history
   */
  getChatHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const history = await getChatHistory(ctx.user.id, input.limit);
        return history;
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        return [];
      }
    }),

  /**
   * Get all conversations for a user
   */
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const history = await getChatHistory(ctx.user.id, 1000);

      const conversations = new Map<string, any>();
      history.forEach((msg) => {
        const convId = msg.conversationId || "default";
        if (!conversations.has(convId)) {
          conversations.set(convId, {
            id: convId,
            messages: [],
            createdAt: msg.createdAt,
            lastMessage: msg.content,
          });
        }
        conversations.get(convId)!.messages.push(msg);
      });

      return Array.from(conversations.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      return [];
    }
  }),

  /**
   * Clear a conversation
   */
  clearConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return {
          success: true,
          message: "Conversation cleared",
        };
      } catch (error) {
        console.error("Failed to clear conversation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to clear conversation",
        });
      }
    }),

  /**
   * Get product recommendations from chatbot
   */
  getProductRecommendation: protectedProcedure
    .input(
      z.object({
        symptoms: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const messages: any[] = [
          {
            role: "system",
            content: JAPANESE_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Based on these symptoms, recommend products from PharmaBridge: ${input.symptoms}`,
          },
        ];

        const response = await invokeLLM({
          messages,
        });

        return {
          recommendation: response.choices[0]?.message?.content || "Unable to generate recommendation",
        };
      } catch (error) {
        console.error("Failed to get product recommendation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get recommendation",
        });
      }
    }),
});

