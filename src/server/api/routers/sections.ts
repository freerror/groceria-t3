import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "y/server/api/trpc";

export const sectionRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.section.findMany();
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.section.create({
        data: {
          title: input.title,
        },
      });
    }),
});
