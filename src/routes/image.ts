import { Context, Next } from "koa"
import path from 'path'
import fs from 'fs'
import DB from '../database'
import send from 'koa-send'
import sharp from 'sharp'
import mime from 'mime-types'

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
 *      format    jpg / png/ webp / tiff
 *      size      100-100
 *      fit       
 * 
 * 
 *      format_size_fit.format
 *      webp_100-100_contain.webp
 *      100-100_contain.webp
 * 
 *      [size_fit][engine opts].[format]
 *      100-100_contain_quality-100_lossless.webp
 *        
 * 
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
  const listEngineOption = ['format', 'quality']
  const listResizeOption = ['width', 'height', 'fit']
  
  let engineOptions: any = {}
  let resizeOptions: any = {}


  // make option objects
  Object.entries(query).forEach((para: any) => {
    let [param, val] = para
    
    if(listEngineOption.includes(param)){
      if(param === 'quality') {
        engineOptions[param] = parseInt(val)
      } else {
        engineOptions[param] = val
      }
    }

    if(listResizeOption.includes(param)){
      if(param === 'width' || param === 'height') {
        resizeOptions[param] = parseInt(val)
      } else {
        resizeOptions[param] = val
      }
    }
  })

  // check required params
  const listRequired = ['format']
  listRequired.forEach((el: any) => {
    if(!engineOptions[el]) {
      throw new Error(`missing '${el}' param`)
    }
  })

  // generate new fileName
  const format = engineOptions.format
  let newName = '' 
  
  Object.entries(engineOptions).map((el: any) => {
    let [key, val] = el;
    console.log('\n\n+++', key, val, '\n\n')
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

  const optimizedImgBuffer = await sharp(originalFilePath)
    .resize((resizeOptions.width || resizeOptions.height) ? resizeOptions : {})
    .toFormat(format, engineOptions)
    .toBuffer()

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