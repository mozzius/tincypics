import { z } from "zod";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../../env/server.mjs";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const client = new S3Client({
  region: env.UPLOAD_AWS_REGION,
  credentials: {
    accessKeyId: env.UPLOAD_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.UPLOAD_AWS_SECRET_ACCESS_KEY,
  },
});

export const imagesRouter = router({
  upload: publicProcedure
    .input(
      z
        .object({
          slug: z.string(),
          width: z.number(),
          height: z.number(),
        })
        .array()
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const [urls] = await Promise.all([
        await Promise.all(
          input.map(async ({ slug }) => {
            const command = new PutObjectCommand({
              Bucket: env.UPLOAD_AWS_S3_BUCKET,
              Key: slug,
            });
            return {
              slug,
              url: await getSignedUrl(client, command, { expiresIn: 3600 }),
            };
          })
        ),
        await ctx.prisma.image.createMany({
          data: input.map((images) => ({
            ...images,
            userId,
          })),
        }),
      ]);
      return urls;
    }),
  get: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const image = await ctx.prisma.image.findUnique({
      where: { slug: input },
      include: { user: true },
    });
    if (!image) {
      throw new Error("Image not found");
    }
    return image;
  }),
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const image = await ctx.prisma.image.findUnique({
        where: { id: input },
      });
      if (!image) throw new Error("Image not found");
      if (image.userId !== userId) throw new Error("Not your image");
      await ctx.prisma.image.delete({
        where: {
          id: input,
        },
      });
      return image;
    }),

  deleteBySlug: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const image = await ctx.prisma.image.findUnique({
        where: { slug: input },
      });
      if (!image) throw new Error("Image not found");
      if (image.userId !== userId) throw new Error("Not your image");
      await ctx.prisma.image.delete({
        where: {
          slug: input,
        },
      });
      return image;
    }),
});
