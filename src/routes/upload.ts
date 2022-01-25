import { Context, Next } from 'koa'
import path from 'path'
import { uid } from 'uid/secure'
import { moveFile, getImgDimensions } from '../utils'
import DB from '../database'

interface File {
	path: string
	name: string
	size: string
	type: string
}

interface Req extends Request {
	files: Object
}

export default async (ctx: Context, next: Next) => {
	const request = <Req>(<unknown>ctx.request)

	const { files } = request

	if (!files) {
		throw new Error('missing files')
	}

	const listFile = Object.values(files).flat()

	let listRes = []

	for (let file of listFile) {
		const { path: oldPath, name: originalName, size, type } = <File>file

		const ext = originalName.split('.')[originalName.split('.').length - 1]
		const id = uid(14)
		const newName = `${id}.${ext}`
		const newPath = path.join(__dirname, '../../volume/files/original', newName)

		const { width, height } = await getImgDimensions(oldPath)

		const data = {
			name: newName,
			originalName,
			ext,
			type,
			size,
			width,
			height,
			date: Date.now(),
		}

		try {
			await moveFile(oldPath, newPath)

			listRes.push({
				status: 'success',
				data: {
					id,
					...data,
				},
			})

			DB.merge('/', {
				[id]: {
					...data,
				},
			})
		} catch (error: any) {
			console.error(error)

			listRes.push({
				status: 'error',
				data: {
					name,
					error,
				},
			})

			DB.merge('/', {
				[id]: {
					...data,
					error: 'uploading with error: ' + error.message,
				},
			})
		}
	}

	ctx.body = JSON.stringify(listRes)

	await next()
}
