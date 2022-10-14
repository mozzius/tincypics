// src/server/trpc/router/_app.ts
import { router } from "../trpc";
import { imagesRouter } from "./images";
import { userRouter } from "./user";

export const appRouter = router({
  images: imagesRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
