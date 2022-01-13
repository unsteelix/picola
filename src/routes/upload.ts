import { Context, Next } from "koa"

export default async (ctx: Context, next: Next) => {
  const data = ctx.request.body;
  ctx.body = data;

  await next()
}