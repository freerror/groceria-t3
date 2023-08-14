import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const sectionRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.section.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingSection = await ctx.prisma.section.findFirst({
        where: {
          title: input.title,
          userId: ctx.session.user.id,
        },
      });
      if (existingSection) {
        console.log("existingSection", existingSection);
        return existingSection;
      }
      return ctx.prisma.section.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
        },
      });
    }),
  createMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existingTitles = (
        await ctx.prisma.section.findMany({
          where: { userId },
        })
      ).map((section) => section.title);
      const data = input
        .filter((section) => !existingTitles.includes(section))
        .map((section) => ({
          title: section,
          userId,
        }));
      return ctx.prisma.section.createMany({
        data,
      });
    }),
});
