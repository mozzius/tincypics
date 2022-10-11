import { z } from "zod";
import { createRouter } from "./context";

export const userRouter = createRouter().query("profile", {
  input: z.object({
    id: z.string(),
  }),
  async resolve({ ctx, input }) {
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.id },
      include: { images: true },
    });
    return user;
  },
});
