import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany();
  }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        sectionId: z.string(),
        checkStock: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.create({
        data: {
          title: input.title,
          sectionId: input.sectionId,
          checkStock: input.checkStock,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        sectionId: z.string(),
        checkStock: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.update({
        where: { id: input.id },
        data: {
          title: input.title,
          sectionId: input.sectionId,
          checkStock: input.checkStock,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
