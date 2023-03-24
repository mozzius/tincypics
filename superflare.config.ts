import { defineConfig } from "superflare";

export default defineConfig<Env>((ctx) => {
  return {
    appKey: ctx.env.APP_KEY,
    database: {
      default: ctx.env.DB,
    },
    storage: {
      default: {
        binding: ctx.env.BUCKET,
        publicPath: "/i"
      },
    },
    queues: {
      default: ctx.env.QUEUE,
    },
  };
});