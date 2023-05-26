import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { productRouter } from "./routers/products";
import { sectionRouter } from "./routers/sections";
import { recipeRouter } from "./routers/recipe";
import { recipeRelationsRouter } from "./routers/recipeRelations";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  product: productRouter,
  section: sectionRouter,
  recipe: recipeRouter,
  recipeRelations: recipeRelationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
