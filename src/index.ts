import Koa, { Context } from 'koa'
import body from 'koa-better-body'
import Router from 'koa-router'
import json from 'koa-json'
import logger from 'koa-logger'
import cors from '@koa/cors'
import constants from './utils/constants'
import indexRoute from './routes/index'
import uploadRoute from './routes/upload'
import imageV1Route from './routes/imageV1'

const app = new Koa();
const router = new Router();

router.get('/', indexRoute)
router.post('/upload', uploadRoute)

router.get('/image/:id', imageV1Route)
router.get('/img/:id', imageV1Route)
router.get('/i/:id', imageV1Route)

router.get('/v1/img/:id', imageV1Route)
router.get('/v1/i/:id', imageV1Route)


// Middlewares
app.use(cors());
app.use(json())
app.use(logger())
app.use(body({ multipart: true }))

// Routes
app.use(router.routes()).use(router.allowedMethods())


app.on('error', (err: Error, ctx: Context) => {
  console.error('server error', err, ctx)
});

app.listen(constants.PORT);