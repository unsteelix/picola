import { Context, Next } from 'koa'
import DB from '../database'
import constants from '../utils/constants'

export default async (ctx: Context, next: Next) => {
	const { params } = ctx
	const { id } = params
	const token = ctx.header

	if (id === 'all') {

		const { cookie } = ctx.header;
		const token = cookie.split('picola-token=')[1].split(';')[0]

		if(token === constants.TOKEN){
			ctx.body = DB.get('/')
			return
		} else {
			ctx.status = 401
			return
		}

	} else {
		
		const info = DB.get(`/${id}`)
		ctx.body = info
		return
	}

	return
}
