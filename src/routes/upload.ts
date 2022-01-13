import { Context, Next } from "koa"
import fs from 'fs'
import path from 'path'
import { uid } from 'uid/secure';
import { moveFile } from '../utils'

export default async (ctx: Context, next: Next) => {

  const files = ctx.request.files

  if(!files){
    throw new Error('missing files')
  }

  const listFile = Object.values(files).flat()

  let listRes = []

  for(let file of listFile){

    const { path: oldPath, name, size, type } = file

    const ext = name.split('.')[name.split('.').length - 1]
    const id = uid(14)
    const newName = `${id}.${ext}`
    const newPath = path.join(__dirname, '../../volume/files', newName);

    try {
      await moveFile(oldPath, newPath);

      listRes.push({
        status: 'success',
        data: {
          id,
          name,
          ext,
          type,
          size
        }
      })
      
    } catch (error) {
      console.error(error);

      listRes.push({
        status: 'error',
        data: {
          name
        }
      })
    }

  }

  ctx.body = JSON.stringify(listRes)
  
  await next();
}