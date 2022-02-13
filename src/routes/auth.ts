import { Context, Next } from 'koa'
import constants from '../utils/constants'

export default async (ctx: Context, next: Next) => {
	const { params } = ctx
	const { pass } = params

	if (pass === constants.PASS) {
		ctx.body = constants.TOKEN
		return
	}

	return
}
