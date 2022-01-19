import { Context } from 'koa'
import send from 'koa-send'
import md5 from 'md5'
import path from 'path'
import fs from 'fs'
import DB from '../database'


// convert get param to new structure
export const optionsMap: {[key: string]: any} = {
    'f': {
        link: 'format'
    },
    'format': {
        group: 'format',
        available: ['jpeg', 'png', 'webp', 'gif']
    },
    'w': {
        link: 'width'
    },
    'width': {
        group: 'resize',
        type: 'integer',
        min: 1,
        max: 6000
    },
    'h': {
        link: 'height'
    },
    'height': {
        group: 'resize',
        type: 'integer',
        min: 1,
        max: 6000
    },
    'fit': {
        group: 'resize',
        available: ['cover', 'contain', 'fill', 'inside', 'outside']
    },
    'q': {
        link: 'quality'
    },
    'quality': {
        group: 'engine',
        type: 'integer'
    },

    /* other */
    'sharpen': {
        group: 'other',
        type: 'manyParamsInteger'
    },
    'blur': {
        group: 'other',
        type: 'integer'
    },
    'modulate.brightness': {
        group: 'other',
        type: 'integer'
    },
    'modulate.saturation': {
        group: 'other',
        type: 'integer'
    },
    'modulate.hue': {
        group: 'other',
        type: 'integer'
    },
    'modulate.lightness': {
        group: 'other',
        type: 'integer'
    },
    'flip': {
        group: 'other',
        type: 'boolean'
    },

    /* system */
    'dontsave': {
        group: 'system'
    },
    'notsave': {
        group: 'system'
    },
    'save': {
        group: 'system',
        type: 'boolean'
    }
}



// return 'format' | 'resize' | 'engine' | 'other' | 'system'
export const getGroupNameOfParam = (name: string): string => {

    let key = optionsMap[name].link ? optionsMap[name].link : name // to full

    return optionsMap[key].group
}

// return true, if path like this: 'modulate.hue'
export const isLongPathName = (pathName: string) => pathName.split('.').length > 0

// return type or null
export const getQueryType = (queryName: string): string | null => {
    const { type = null } = optionsMap[queryName]
    return type
}

export const isQueryWithManyParams = (queryName: string): boolean => {
    const type = getQueryType(queryName)
    
    if(!type) {
        return false
    }

    return type.indexOf('manyParams') !== -1 ? true : false
}


export const queryParamsToOptions = (ctx: Context) => {

    let { query: raw } = ctx.request
    let query = cleanQuery(raw)

    let options: {[key: string]: any} = {
        format: {},
        resize: {},
        engine: {},
        other: {},
        system: {}
    }


    for(let key in optionsMap) {
        let val: any = query[key]
 
        if(val || (typeof val === 'string')) {
            key = optionsMap[key].link ? optionsMap[key].link : key  // to full
            const option = optionsMap[key]
            const { group, type } = option

            val = convertType(type, val) // convert type
            checkValue(option, val)

            console.log(`[${group}]${type ? `[${type}]` : '[       ]'} ${JSON.stringify(key, null, 2)} => ${JSON.stringify(val, null, 2)}`) 
            
            if(!isLongPathName(key)) { // short

                options[group] = val

            } else {                   // long, like 'modulate.hue'
                
                let node = options[group]

                key.split('.').forEach((el: string, i: number) => {
                    if(!node[el]){
                      node[el] = {}
                    }
                    if(i === key.split('.').length - 1) {
                      node[el] = val
                    }
                    node = node[el]
                });

            }

        }
    }

    return options
}




// return original file
export const checkForOriginal = async (ctx: Context) => {
    const { query } = ctx.request

    if(Object.keys(query).length === 0){
        try {
            await send(ctx, `./volume/files/original/${ctx.image.name}`)
            return true
        } catch(e: any) {
            console.error(e.message)
            return false
        }
    }
    return false
}

// return cached file
export const checkForCache = async (ctx: Context, fileName: string) => {
    try {
        await send(ctx, `./volume/files/optimized/${fileName}`)
        return true
    } catch(e: any) {
        console.log('cache not found') 
        return false
    }
}


// save file
export const checkForSave = async (options: any, newFileName: string, newFileBuffer: any) => {
    if(isNeedSaving(options)) {
        const optimizedFilePath = path.resolve(__dirname, '../../volume/files/optimized', newFileName)

        fs.writeFile(optimizedFilePath, newFileBuffer, (e: any) => {
            if(e) {
                console.error(e.message)
                return
            }
        })
        console.log(`save file: ${newFileName}`)
    }
}



export const getImgById = (id: string) => {
    return DB.get(`/${id}`)
}


// if value is array of str, convert to str
export const cleanQuery = (query: any) => {
    let res: {[key: string]: string} = {}
    for(let key in query) {
        let val = query[key]
        if(Array.isArray(val)){
            res[key] = val.join(',')
        } else {
            res[key] = val
        }
    }
    return res
}


export const fillVoidOptions = (ctx: Context, options: any) => {
    let image = ctx.image
    const { width, height, ext } = image

    if(!options.format.format) {
        options.format.format = ext
    }

    if(!options.resize.width && !options.resize.height) {
        options.resize.width = width
        options.resize.height = height
    }

    if(isNeedResize(ctx)) {
        if(!options.resize.fit) {
            options.resize.fit = 'cover'
        }
    }

    return options
}



export const resizeImg = (ctx: Context, sharpEl: any, options: any) => {
    if(isNeedResize(ctx)) {
        console.log('isNeedResize: true') 
        sharpEl = sharpEl.resize(options.resize)
    }
    return sharpEl
}


export const formatImg = (ctx: Context, sharpEl: any, options: any) => {
    if(isNeedFormatting(ctx, options)) {
        console.log('isNeedFormatting: true') 
        sharpEl = sharpEl.toFormat(options.format.format, options.engine)
    }
    return sharpEl
}


export const otherFormatImg = (ctx: Context, sharpEl: any, options: any) => {
    if(isNeedOtherFormatting(options)) {
        console.log('isNeedOtherFormatting: true')
        
        const { other } = options

        for(let key in other) {
            const val = other[key]
            const manyParams = isQueryWithManyParams(key)

            if(manyParams) {
                sharpEl = sharpEl[key](...val)
            } else {
                sharpEl = sharpEl[key](val)
            }
        }

    }
    return sharpEl
}




// return true, if need resizing
export const isNeedResize = (ctx: Context): boolean => {
    const { query } = ctx.request

    // nothing set
    if(!('width' in query && query.width) && !('height' in query && query.height) && !('w' in query && query.w) && !('h' in query && query.h)) {
        return false
    }

    // set both
    if(('width' in query && query.width) && ('height' in query && query.height) && ('w' in query && query.w) && ('h' in query && query.h)) {
        const { image } = ctx
        const { width, height } = image

        if((width === query.width || width === query.w) && (height === query.height || height === query.h)) {
            return false
        } else {
            return true
        }
    }

    // set only width or only height
    if(('width' in query && query.width) || ('height' in query && query.height)) {
        return true
    }
    if(('w' in query && query.w) || ('h' in query && query.h)) {
        return true
    }

    return false
}


// return true, if need formatting (toFormat)
export const isNeedFormatting = (ctx: Context, options: any): boolean => {
    const { query } = ctx.request
    const { image } = ctx

    let haveEngineSettings = false

    const { engine } = options
    if(Object.keys(engine).length > 0) {
        haveEngineSettings = true
    }

    if(haveEngineSettings) {
        return true
    }

    let haveAnotherFormat = false

    const { ext } = image
    const format = 'format' in query && query.format ? query.format : null
    if(ext !== format) {
        haveAnotherFormat = true
    }

    if(haveAnotherFormat) {
        return true
    }

    return false
}


// return true, if need other formatting
export const isNeedOtherFormatting = (options: any): boolean => {
    const { other } = options

    if(Object.keys(other).length > 0) {
        return true
    }

    return false
}


export const isNeedSaving = (options: any) => {
    const { system } = options

    if('dontsave' in system || 'notsave' in system || ('save' in system && system.save === 'false')) {
        return false
    }

    return true
}


// convert string to other type 
export const convertType = (type: string, value: string): string | number | Array<any> | boolean => {

    if(type === 'integer') {
        return parseInt(value)
    }
  
    if(type === 'float') {
        return parseFloat(value)
    }
  
    if(type === 'array') {
        return value.split(',').map(el => el.trim())
    }
  
    if(type === 'arrayInteger') {
        return value.split(',').map(el => parseInt(el))
    }
  
    if(type === 'arrayFloat') {
        return value.split(',').map(el => parseFloat(el))
    }

    if(type === 'boolean') {
        return value === 'true' ? true : false
    }

    if(type === 'manyParamsInteger') {
        return value.split(',').map(el => parseInt(el))
    }

    return value
}








// check value for min, max and available
export const checkValue = (option: {[key: string]: any}, value: any) => {
    const { available, min, max } = option
    
    if(available) {
      if(!available.includes(value)) {
        throw new Error(`value '${value}' not available. Try: ${JSON.stringify(available)}`)
      }
    }
  
    if(min && value < min) {
      throw new Error(`value ${value} too small. Minimum ${min}`)
    }
  
    if(max && value > max) {
      throw new Error(`value ${value} too big. Maximum ${max}`)
    }
}



// generate uniq filename by options
export const generateFileName = (ctx: Context, options: any) => {

    const { image } = ctx
    const { name } = image
    const id = name.split('.')[0]

    const optionHash = md5(JSON.stringify(options))

    const res = `${id}_${optionHash}.${options.format.format}`

    return res
}