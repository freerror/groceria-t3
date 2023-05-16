import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "y/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany();
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.create({
        data: {
          title: input.title,
        },
      });
    }),
});
