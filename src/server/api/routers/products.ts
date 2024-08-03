import { Product, Section } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany({
      where: {
        OR: [
          {
            userId: ctx.session?.user?.id,
          },
          {
            userId: "",
          },
          {
            userId: null,
          },
        ],
      },
      include: {
        section: true,
      },
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        sectionId: z.string(),
        checkStock: z.boolean(),
        publicProduct: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = input.publicProduct ? null : ctx.session?.user?.id;
      return ctx.prisma.product.create({
        data: {
          title: input.title,
          sectionId: input.sectionId,
          checkStock: input.checkStock,
          userId: userId,
        },
      });
    }),
  createMany: publicProcedure
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
      const userId = ctx.session?.user?.id;
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
          userId: ctx.session?.user?.id,
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
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        sectionId: z.string(),
        checkStock: z.boolean(),
        publicProduct: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = input.publicProduct ? null : ctx.session?.user?.id;
      return ctx.prisma.product.update({
        where: { id: input.id },
        data: {
          title: input.title,
          sectionId: input.sectionId,
          checkStock: input.checkStock,
          userId: userId,
        },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.delete({
        where: {
          id: input.id,
        },
      });
    }),
  deleteMany: publicProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.product.deleteMany({
      where: {
        userId: ctx.session?.user?.id,
      },
    });
  }),
});
