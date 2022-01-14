import { Context, Next } from "koa"
import fs from 'fs'
import path from 'path'
import { uid } from 'uid/secure'
import { moveFile } from '../utils'
import DB from '../database'


interface File {
  path: string,
  name: string,
  size: string,
  type: string
}

export default async (ctx: Context, next: Next) => {

  const files = ctx.request.files

  if(!files){
    throw new Error('missing files')
  }

  const listFile = Object.values(files).flat()

  let listRes = []

  for(let file of listFile){

    const { path: oldPath, name, size, type } = <File>file

    const ext = name.split('.')[name.split('.').length - 1]
    const id = uid(14)
    const newName = `${id}.${ext}`
    const newPath = path.join(__dirname, '../../volume/files', newName);

    const data = {
      name,
      ext,
      type,
      size,
      date: Date.now()
    }

    try {
      await moveFile(oldPath, newPath);

      listRes.push({
        status: 'success',
        data: {
          id,
          ...data
        }
      })

      DB.merge('/', {
        [id]: {
          ...data
        }
      })
      
    } catch (error: any) {
      console.error(error);

      listRes.push({
        status: 'error',
        data: {
          name,
          error
        }
      })

      DB.merge('/', {
        [id]: {
          ...data,
          error: 'uploading with error: ' + error.message
        }
      })

    }

  }

  ctx.body = JSON.stringify(listRes)
  
  await next();
}