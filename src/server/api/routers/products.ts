import { Product, Section } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        section: true,
      },
    });
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
          userId: ctx.session.user.id,
        },
      });
    }),
  createMany: protectedProcedure
    .input(
      z.array(
        z.object({
          title: z.string(),
          sectionTitle: z.string(),
          checkStock: z.boolean(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existingTitles = (
        await ctx.prisma.product.findMany({
          where: {
            userId,
          },
        })
      ).map((product) => product.title);
      const newProducts = input.filter(
        (product) => !existingTitles.includes(product.title)
      );
      const sections = await ctx.prisma.section.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });
      const data = newProducts.map((product) => ({
        title: product.title,
        sectionId: sections.find(
          (section) => section.title === product.sectionTitle
        )?.id,
        checkStock: product.checkStock,
        userId,
      }));

      return ctx.prisma.product.createMany({ data });
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
  deleteMany: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.product.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
