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
