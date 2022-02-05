import Koa, { Context } from 'koa'
import body from 'koa-better-body'
import Router from 'koa-router'
import json from 'koa-json'
import logger from 'koa-logger'
//import cors from '@koa/cors'
import serve from 'koa-static'
import constants from './utils/constants'
import indexRoute from './routes/index'
import uploadRoute from './routes/upload'
import docsRoute from './routes/docs'
import imageV1Route from './routes/imageV1'

const app = new Koa()
const router = new Router()

router.get('/', indexRoute)
router.post('/upload', uploadRoute)
router.get('/docs', docsRoute)

router.get('/image/:id', imageV1Route)
router.get('/img/:id', imageV1Route)
router.get('/i/:id', imageV1Route)

router.get('/v1/image/:id', imageV1Route)
router.get('/v1/img/:id', imageV1Route)
router.get('/v1/i/:id', imageV1Route)

// Middlewares
// app.use(
// 	cors({
// 		origin: '*',
// 	})
// )
app.use(async (ctx, next) => {
	ctx.set('Access-Control-Allow-Origin', '*')
	ctx.set('Access-Control-Allow-Methods', 'POST, GET')
	await next()
})
app.use(json())
app.use(logger())
app.use(body({ multipart: true }))
app.use(serve('static'))
app.use(async (ctx, next) => {
	try {
		await next()
	} catch (e: any) {
		const { name, message } = e
		const msg = `[${name}] ${message}`
		console.error(msg)

		ctx.status = 400
		ctx.body = msg
	}
})

// Routes
app.use(router.routes()).use(router.allowedMethods())

app.on('error', (err: Error, ctx: Context) => {
	console.error('[SERVER ERROR]', err.message)
})

app.listen(constants.PORT)
