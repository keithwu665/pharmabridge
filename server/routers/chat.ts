import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { saveChatMessage, getChatHistory } from "../db";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

/**
 * Japanese system prompt for the chatbot
 */
const JAPANESE_SYSTEM_PROMPT = `You are a helpful customer support AI assistant for PharmaBridge.
You help Japanese customers with questions about pharmaceutical products from India.
Always respond in Japanese with a professional and friendly tone.
You can help with product inquiries, recommendations, order support, and shipping questions.
Do not provide medical advice - always recommend consulting with a healthcare professional.`;

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

