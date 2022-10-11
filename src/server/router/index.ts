// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { imagesRouter } from "./images";
import { protectedExampleRouter } from "./protected-example-router";
import { userRouter } from "./user";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", protectedExampleRouter)
  .merge("images.", imagesRouter)
  .merge("user.", userRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
