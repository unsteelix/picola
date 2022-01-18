import { Context, Next } from "koa"
import send from 'koa-send'

export default async (ctx: Context, next: Next) => {
  await send(ctx, './src/pages/docs.html')
}