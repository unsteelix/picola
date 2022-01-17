import { Context, Next } from "koa"
import path from 'path'
import sharp from 'sharp'
import mime from 'mime-types'
import { getImgById, checkForOriginal, queryParamsToOptions, fillVoidOptions, generateFileName, checkForCache, resizeImg, formatImg, checkForSave, otherFormatImg } from '../utils/image'


export default async (ctx: Context, next: Next) => {

  const { params } = ctx
  const { id } = params  
  
  const image = getImgById(id)
  const { name: fileName } = image

  ctx.image = image


  // original
  if(await checkForOriginal(ctx)) {
    console.log('return original')
    return
  }

  // optimized
  let options = queryParamsToOptions(ctx)

  // fill void options
  options = fillVoidOptions(ctx, options)
  console.log('\noptions:', JSON.stringify(options, null, 2), '\n') 

  // generate new name
  const newFileName = generateFileName(ctx, options)
  console.log('generic filename: ', newFileName) 

  // use cache
  if(await checkForCache(ctx, newFileName)) {
    console.log('return cache')
    return
  }

  // optimize
  const originalFilePath = path.resolve(__dirname, '../../volume/files/original', fileName)

  let sharpEl = sharp(originalFilePath)

  // resize
  sharpEl = resizeImg(ctx, sharpEl, options)
  
  // toFormat
  sharpEl = formatImg(ctx, sharpEl, options)

  // other image manipulations
  sharpEl = otherFormatImg(ctx, sharpEl, options)

  // toBuffer
  const optimizedImgBuffer = await sharpEl.toBuffer()

  const contentType = mime.contentType(newFileName) || 'image/jpeg'

  ctx.response.set("content-type", contentType);
  ctx.body = optimizedImgBuffer

  // save
  checkForSave(options, newFileName, optimizedImgBuffer)

  return
}