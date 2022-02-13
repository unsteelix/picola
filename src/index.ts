import Koa, { Context } from 'koa'
import body from 'koa-better-body'
import Router from 'koa-router'
import json from 'koa-json'
import logger from 'koa-logger'
import serve from 'koa-static'
import constants from './utils/constants'
import log from './utils/logger'
import indexRoute from './routes/index'
import uploadRoute from './routes/upload'
import docsRoute from './routes/docs'
import previewRoute from './routes/preview'
import infoRoute from './routes/info'
import authRoute from './routes/auth'
import imageV1Route from './routes/imageV1'

const app = new Koa()
const router = new Router()

router.get('/', indexRoute)
router.get('/docs', docsRoute)
router.get('/preview', previewRoute)

router.post('/upload', uploadRoute)
router.get('/info/:id', infoRoute)
router.get('/auth/:pass', authRoute)

router.get('/image/:id', imageV1Route)
router.get('/img/:id', imageV1Route)
router.get('/i/:id', imageV1Route)

router.get('/v1/image/:id', imageV1Route)
router.get('/v1/img/:id', imageV1Route)
router.get('/v1/i/:id', imageV1Route)

// Middlewares
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
		log.error(msg)

		ctx.status = 400
		ctx.body = msg
	}
})

// Routes
app.use(router.routes()).use(router.allowedMethods())

app.on('error', (err: Error, ctx: Context) => {
	log.error('[SERVER ERROR]', err.message)
})

app.listen(constants.PORT, () => {
	log.show()
	log.ok(`Server listening on port ${constants.PORT}`)
	log.show()
})
