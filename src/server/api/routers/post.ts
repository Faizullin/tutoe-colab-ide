import { documentIdValidator } from "@/lib/schema";
import { adminProcedure, publicProcedure, router } from "@/server/api/trpc";
import { z } from "zod";
import { baseQueryInputSchema } from "../schema";

const queryFilterSchema = baseQueryInputSchema.shape.filter.unwrap().extend({
  title: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe("Search term for post title"),
});

const queryOrderBySchema = baseQueryInputSchema.shape.orderBy.unwrap().extend({
  field: z
    .enum(["createdAt", "updatedAt", "id", "index"])
    .default("createdAt")
    .describe("The field to order posts by."),
});

const queryInputSchema = z
  .object({
    pagination: baseQueryInputSchema.shape.pagination,
    orderBy: queryOrderBySchema,
    filter: queryFilterSchema,
  })
  .optional();

const documentSlugValidator = (zod = z) => {
  return zod
    .string()
    .min(1)
    .max(255)
    .refine((val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
      message: "Document slug must be a valid slug format",
    });
};

const createPostInputSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().optional(),
  slug: documentSlugValidator(),
  thumbnailImageId: documentIdValidator().nullable().optional(),
  index: z.number().int().nullable().optional(),
});

export const postRouter = router({
  publicList: publicProcedure
    .input(queryInputSchema)
    .query(async ({ ctx, input }) => {
      const {
        filter = {},
        orderBy = { field: "index", direction: "desc" },
        pagination = { skip: 0, take: 20 },
      } = input || {};

      const where: any = {};
      if (filter.title?.trim()) {
        const searchTerm = filter.title.trim();
        where.OR = [{ title: { contains: searchTerm, mode: "insensitive" } }];
      }

      const [items, total] = await Promise.all([
        ctx.prisma.post.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.direction },
          skip: pagination.skip,
          take: pagination.take,
          include: {
            thumbnailImage: {
              select: {
                id: true,
                mimetype: true,
                size: true,
                filename: true,
                url: true,
              },
            },
          },
        }),
        ctx.prisma.post.count({ where }),
      ]);

      return {
        items,
        total,
        meta: {
          take: pagination.take,
          skip: pagination.skip,
        },
      };
    }),

  publicGetById: publicProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input },
        include: {
          thumbnailImage: {
            select: {
              id: true,
              mimetype: true,
              size: true,
              filename: true,
              url: true,
            },
          },
        },
      });
      if (!post) throw new Error("Post not found");
      return post;
    }),

  publicGetBySlug: publicProcedure
    .input(documentSlugValidator())
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findFirst({
        where: { slug: input },
        include: {
          thumbnailImage: {
            select: {
              id: true,
              mimetype: true,
              size: true,
              filename: true,
              url: true,
            },
          },
        },
      });
      if (!post) throw new Error("Post not found");
      return post;
    }),

  adminList: adminProcedure
    .input(queryInputSchema)
    .query(async ({ ctx, input }) => {
      const {
        filter = {},
        orderBy = { field: "id", direction: "desc" },
        pagination = { skip: 0, take: 20 },
      } = input || {};

      const where: any = {};
      if (filter.title?.trim()) {
        const searchTerm = filter.title.trim();
        where.OR = [{ title: { contains: searchTerm, mode: "insensitive" } }];
      }

      const [items, total] = await Promise.all([
        // add prefetch owner

        ctx.prisma.post.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.direction },
          skip: pagination.skip,
          take: pagination.take,
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        }),
        ctx.prisma.post.count({ where }),
      ]);

      return {
        items,
        total,
        meta: {
          take: pagination.take,
          skip: pagination.skip,
        },
      };
    }),

  adminDetail: adminProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          thumbnailImage: {
            select: {
              id: true,
              mimetype: true,
              size: true,
              filename: true,
              url: true,
            },
          },
        },
      });
      if (!post) throw new Error("Post not found");
      return post;
    }),

  adminCreate: adminProcedure
    .input(createPostInputSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug;
      const existingPost = await ctx.prisma.post.findUnique({
        where: { slug },
      });
      if (existingPost) {
        throw new Error("Post with this slug already exists");
      }
      return {
        post: await ctx.prisma.post.create({
          data: {
            // ownerId: ctx.session!.user.id,
            title: input.title,
            content: input.content || "",
            slug: input.slug,
            thumbnailImageId: input.thumbnailImageId || null,
            index: input.index || null,
          },
        }),
      };
    }),

  adminUpdate: adminProcedure
    .input(
      createPostInputSchema.extend({
        id: documentIdValidator(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        post: await ctx.prisma.post.update({
          where: { id: input.id },
          data: {
            title: input.title,
            content: input.content || "",
            slug: input.slug,
            thumbnailImageId: input.thumbnailImageId || null,
            index: input.index || null,
          },
        }),
      };
    }),

  adminDelete: adminProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.post.delete({
        where: { id: input },
      });
    }),
});
