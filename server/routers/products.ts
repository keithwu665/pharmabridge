import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getProducts, getProductById } from "../db";

export const productsRouter = router({
  /**
   * List all products with optional filtering
   */
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await getProducts(input.category, input.search);
        return products.map((p: any) => ({
          ...p,
          specifications: p.specifications ? JSON.parse(p.specifications) : {},
        }));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
      }
    }),

  /**
   * Get product by category
   */
  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.enum(["ED", "AGA", "cancer_targeted", "other"]),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await getProducts(input.category);
        return products.map((p: any) => ({
          ...p,
          specifications: p.specifications ? JSON.parse(p.specifications) : {},
        }));
      } catch (error) {
        console.error("Failed to fetch products by category:", error);
        return [];
      }
    }),

  /**
   * Get product detail
   */
  getDetail: publicProcedure
    .input(
      z.object({
        id: z.string().transform((v) => parseInt(v, 10)),
      })
    )
    .query(async ({ input }) => {
      try {
        const product = await getProductById(input.id);
        if (!product) {
          throw new Error("製品が見つかりません");
        }
        return {
          ...product,
          specifications: product.specifications ? JSON.parse(product.specifications) : {},
        };
      } catch (error) {
        console.error("Failed to fetch product detail:", error);
        throw error;
      }
    }),

  /**
   * Search products
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await getProducts(undefined, input.query);
        return products.map((p: any) => ({
          ...p,
          specifications: p.specifications ? JSON.parse(p.specifications) : {},
        }));
      } catch (error) {
        console.error("Failed to search products:", error);
        return [];
      }
    }),

  /**
   * Get product recommendations based on category
   */
  getRecommendations: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await getProducts(input.category);
        // Return limited recommendations
        return products
          .slice(0, input.limit)
          .map((p: any) => ({
            ...p,
            specifications: p.specifications ? JSON.parse(p.specifications) : {},
          }));
      } catch (error) {
        console.error("Failed to get recommendations:", error);
        return [];
      }
    }),
});
