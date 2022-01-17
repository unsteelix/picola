import { Context, Next } from "koa"
import path from 'path'
import fs from 'fs'
import DB from '../database'
import send from 'koa-send'
import sharp from 'sharp'
import mime from 'mime-types'
import utils, { parseQueryToImgParams } from '../utils'

// enum Params {
//   width = 'width',
//   height = 'height',
//   fit = 'fit',
//   format = 'format',
//   quality = 'quality',
//   save = 'save'
// }

// type Param = 'width' | 'height' | 'fit' | 'format' | 'quality' | 'save'

// type ListParam = Param[]

// type ImgParams = {
//   [key in Param]?: string
// }


/**
 * 
 * 
 *      [resizeOptions][engineOptions][otherOptions?].[format]
 * 
 *      [width_height_fit?]_[quality]_[blur_sharpen_hue].format
 *      width-100_height-100_fit-cover_quality-90_blur-10_sharpen-10_hue-10.web.p
 * 
 *      width
 *      height
 *      fit
 *      format
 *      
 *      quality
 * 
 *      save
 * 
 *      [format][size][engineOpts?][other?]
 *      
 */


export default async (ctx: Context, next: Next) => {


  const { params } = ctx
  const { id } = params

  const query = ctx.request.query
  
  const image = DB.get(`/${id}`)

  const { ext } = image

  const fileName = `${id}.${ext}`

  // return original
  if(Object.keys(query).length === 0){
    return await send(ctx, `./volume/files/original/${fileName}`)
  }

  // return optimized
  const { format, resizeOptions, engineOptions, otherOptions } = parseQueryToImgParams(query)

  // generate new fileName
  let newName = '' 
  
  Object.entries({...resizeOptions, ...engineOptions}).map((el: any) => {
    let [key, val] = el;
    newName += `${key}-${val}_`
  })
  newName = `${newName.slice(0, newName.length - 1)}.${format}`

  const contentType = mime.contentType(newName) || 'image/jpeg'

  // use cache
  const cacheFilePath = path.resolve(__dirname, '../../volume/files/optimized', newName)

  try {
    const cache = fs.readFileSync(cacheFilePath)
  
    ctx.response.set("content-type", contentType);
    ctx.body = cache
    return

  } catch(e) {
    console.error(e)
  }

  const originalFilePath = path.resolve(__dirname, '../../volume/files/original', fileName)

  let sharpEl = sharp(originalFilePath)
    .resize(resizeOptions)
  
  if(format) {
    sharpEl = sharpEl
      .toFormat(format, engineOptions)
  }

  // if(Object.keys(otherOptions).length > 0) {
  //   const [operationFullName, operationValue] = Object.entries(otherOptions)[0]
  //   const [operationName, operationKey] = operationFullName.split('.')

  //   sharpEl = sharpEl.[operationName]({
  //       [operationKey]: operationValue
  //     })
  // }

  const optimizedImgBuffer = await sharpEl.toBuffer()

  // check 'save' param
  let withSaving = true
  if('save' in query && query.save === 'false'){
    withSaving = false
  }

  ctx.response.set("content-type", contentType);
  ctx.body = optimizedImgBuffer

  if(withSaving){
    const optimizedFilePath = path.resolve(__dirname, '../../volume/files/optimized', newName)

    fs.writeFile(optimizedFilePath, optimizedImgBuffer, err => {
      if (err) {
        console.error(err)
        return
      })
  }

  return
}