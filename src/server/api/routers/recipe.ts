import { RecipeRelations } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const recipeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.recipe.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string(), productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const recipe = await ctx.prisma.recipe.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
        },
      });
      const relationData = input.productIds.map((productId: string) => ({
        recipeId: recipe.id,
        productId,
      }));
      await ctx.prisma.recipeRelations.createMany({ data: relationData });

      return recipe;
    }),
  createMany: protectedProcedure
    .input(
      z.array(
        z.object({ title: z.string(), productTitles: z.array(z.string()) })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const getRecipes = () => {
        return ctx.prisma.recipe.findMany({
          where: {
            userId,
          },
        });
      };
      const existingTitles = (await getRecipes()).map((recipe) => recipe.title);
      const products = await ctx.prisma.product.findMany({
        where: {
          userId,
        },
      });
      const filteredInput = input.filter(
        (recipe) => !existingTitles.includes(recipe.title)
      );
      const data = filteredInput.map((recipe) => ({
        title: recipe.title,
        userId,
      }));
      const res = await ctx.prisma.recipe.createMany({ data });
      const newTitles = data.map((recipe) => recipe.title);
      const allRecipes = (await getRecipes()).filter((recipe) =>
        newTitles.includes(recipe.title)
      );
      const newRelations: RecipeRelations[] = [];
      filteredInput.forEach((recipe) => {
        const recipeId = allRecipes.find(
          (newRecipe) => recipe.title === newRecipe.title
        )?.id as string;
        const productIds = recipe.productTitles.map(
          (productTitle) =>
            products.find((product) => product.title === productTitle)?.id
        ) as string[];
        productIds.forEach((productId) =>
          newRelations.push({ recipeId, productId })
        );
      });
      await ctx.prisma.recipeRelations.createMany({ data: newRelations });
      return res;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        productIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const recipe = await ctx.prisma.recipe.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
        },
      });

      await ctx.prisma.recipeRelations.deleteMany({
        where: {
          recipeId: recipe.id,
        },
      });

      await Promise.all(
        input.productIds.map((productId: string) =>
          ctx.prisma.recipeRelations.create({
            data: {
              recipeId: recipe.id,
              productId,
            },
          })
        )
      );

      return recipe;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.recipe.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
