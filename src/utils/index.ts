import fs from 'fs'
import path from 'path'
import sizeOf  from 'image-size';
import { IOptions } from '../interfaces'

/**
 * get width, height of image
 */
export const getImgDimensions = async (path: string) => {
    try {
        const dimensions = await sizeOf(path)
        const { width, height } = dimensions

        if(!width || !height){
            throw new Error('could not determine the image dimensions')
        }

        return {
            width,
            height
        }
    } catch (err: any) {
        throw new Error(err.message)
    }
}

export const moveFile = async (oldPath: string, newPath: string) => {
  // 1. Create the destination directory
  // Set the `recursive` option to `true` to create all the subdirectories
  await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
  try {
    // 2. Rename the file (move it to the new directory)
    await fs.promises.rename(oldPath, newPath);
  } catch (error: any) {
    if (error.code === 'EXDEV') {
      // 3. Copy the file as a fallback
      await fs.promises.copyFile(oldPath, newPath);
      // Remove the old file
      await fs.promises.unlink(oldPath);
    } else {
      // Throw any other error
      throw error;
    }
  }
}


export const parseQueryToImgParams = (rawQuery: { [key: string]: string | string[] | undefined }): IOptions => {
  
  let query: { [key: string]: string } = {}

  for(let key in rawQuery) {
    let val = rawQuery[key]
    if(val && typeof val === 'string') {
      query[key] = val
    }
  }


  const listResizeParams       = ['width', 'height', 'fit']
  const listMainParams         = ['format', ...listResizeParams]
  const listImageOperations    = ['rotate', 'flip', 'flop', 'affine', 'sharpen', 'median', 'blur', 'flatten', 'gamma', 'negate', 'normalise', 'normalize', 'clahe', 'convolve', 'threshold', 'boolean', 'linear', 'recomb', 'modulate']

  let resizeOptions: { [key: string]: any } = {}
  let engineOptions: { [key: string]: any } = {}
  let otherOptions:  { [key: string]: any } = {}

  // resize options
  if('width' in query && query.width && typeof query.width === 'string') {
    resizeOptions.width = parseInt(query.width)
  }

  if('height' in query && query.height && typeof query.height === 'string') {
    resizeOptions.height = parseInt(query.height)
  }

  if('fit' in query && query.fit && typeof query.fit === 'string') {
    if(!resizeOptions.width || !resizeOptions.height){
      throw new Error(`for 'fit' option you must set up both 'width' and 'height' params`)
    }
    resizeOptions.fit = query.fit
  }

  // engine options
  for(let key in query) {
    if(!listMainParams.includes(key)) {
      if(!listImageOperations.includes(key.split('.')[0])) {
        let val = query[key]
        if(key === 'quality') {
          engineOptions[key] = parseInt(val)
        }
      }
    }
  }

  // other options
  for(let key in query) {
    if(listImageOperations.includes(key.split('.')[0])) {
      otherOptions[key] = query[key]
    }
  }

  let res: IOptions = {
    format: '',
    resizeOptions: resizeOptions || {},
    engineOptions: engineOptions || {},
    otherOptions: otherOptions || {}
  }


  // format
  if('format' in query && query.format && typeof query.format === 'string') {
    let format = formatOptionValue('format', '', query.format)

    res.format = format
  }

  console.log('\n\n----imgParams----', JSON.stringify(res, null, 2), '----\n\n')


  return res
}



export const formatOptionValue = (optionName: 'format' | 'resizeOptions' | 'engineOptions' | 'otherOptions' , optionKey: string, optionValue: string) => {
  
  const listFormats: string[]  = ['jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'tiff']

  if(optionName === 'format') {
    
    if(!listFormats.includes(optionValue)) {
      throw new Error(`bad '${optionValue}' format`)
    }
    
    return optionValue

  } else if(optionName === 'resizeOptions') {

  } else if(optionName === 'engineOptions') {

  } else if(optionName === 'otherOptions') {

  }
}




export default {
    moveFile,
    getImgDimensions,
    parseQueryToImgParams
}