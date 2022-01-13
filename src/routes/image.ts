import { Context, Next } from "koa"

export default async (ctx: Context, next: Next) => {

  ctx.body = 'qrqr';

  await next()
}