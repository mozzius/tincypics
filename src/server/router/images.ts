import { createRouter } from "./context";
import { z } from "zod";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../env/server.mjs";

const client = new S3Client({
  region: env.UPLOAD_AWS_REGION,
  credentials: {
    accessKeyId: env.UPLOAD_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.UPLOAD_AWS_SECRET_ACCESS_KEY,
  },
});

export const imagesRouter = createRouter()
  .mutation("upload", {
    input: z.object({
      slugs: z.string().array(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;
      const [urls] = await Promise.all([
        await Promise.all(
          input.slugs.map(async (slug) => {
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
          data: input.slugs.map((slug) => ({
            slug,
            userId,
          })),
        }),
      ]);
      return urls;
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Not logged in");
      const image = await ctx.prisma.image.findUnique({
        where: { id: input.id },
      });
      if (!image) throw new Error("Image not found");
      if (image.userId !== userId) throw new Error("Not authorized");
      await ctx.prisma.image.delete({
        where: {
          id: input.id,
        },
      });
      return true;
    },
  });
