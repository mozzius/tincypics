import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const userRouter = router({
  profile: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: input },
      include: { images: { orderBy: { createdAt: "desc" } } },
    });
    return user;
  }),
});
