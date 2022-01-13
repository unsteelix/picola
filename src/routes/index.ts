import { Context, Next } from "koa"

export default async (ctx: Context, next: Next) => {
  ctx.body = {
    wer : "erew"
  }

  await next()
}