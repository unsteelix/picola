import { JsonDB } from 'node-json-db'
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'
import constants from '../utils/constants'

class Database {
	filepath: string
	db: any

	constructor(filepath: string) {
		if (!filepath) {
			throw new Error('Filepath to DB not found')
		}
		this.filepath = filepath

		try {
			this.db = new JsonDB(new Config(filepath, true, true, '/'))
		} catch (e: any) {
			console.error(`[DB] ${e.message}`)
			throw new Error(e.message)
		}
		console.log(`[DB] Initialization ${filepath}`)
	}

	get(path: string) {
		console.log('[DB] GET ' + path)

		try {
			const data = this.db.getData(path)
			//console.log(data)
			return data
		} catch (e: any) {
			console.error(`[DB] ${e.message}`)
			throw new Error(e.message)
		}
	}

	push(path: string, data: any) {
		console.log('[DB] PUSH ' + path)
		console.log(data)

		try {
			this.db.push(path, data)
			return this.db.getData(path)
		} catch (e: any) {
			console.error(`[DB] ${e.message}`)
			throw new Error(e.message)
		}
	}

	merge(path: string, data: any) {
		console.log('[DB] MERGE ' + path)
		console.log(data)

		try {
			this.db.push(path, data, false)
			return this.db.getData(path)
		} catch (e: any) {
			console.error(`[DB] ${e.message}`)
			throw new Error(e.message)
		}
	}

	delete(path: string) {
		console.log('[DB] DELETE ' + path)
		this.checkPath(path)

		try {
			this.db.delete(path)
			return true
		} catch (e: any) {
			console.error(`[DB] ${e.message}`)
			throw new Error(e.message)
		}
	}

	count(path: string) {
		console.log('[DB] COUNT ' + path)

		try {
			return this.db.count(path)
		} catch (e: any) {
			console.error(`[DB] ${e.message}`)
			throw new Error(e.message)
		}
	}

	index(path: string, index: string | number, propertyName?: string) {
		console.log(`[DB] INDEX ${path} ${index}${propertyName ? ' ' + propertyName : ''}`)

		try {
			let value = null

			if (propertyName) {
				value = this.db.getIndex(path, index, propertyName)
			} else {
				value = this.db.getIndex(path, index)
			}

			if (value === -1) {
				return null
			}

			return value
		} catch (e: any) {
			console.error(`[DB] ${e.message}`)
			throw new Error(e.message)
		}
	}

	reload() {
		try {
			this.db.reload()
			console.log('[DB] reloaded')
			return true
		} catch (e: any) {
			console.error(`[DB] ${e.message}`)
			throw new Error(e.message)
		}
	}

	checkPath(path: string) {
		try {
			this.db.getData(path)
		} catch (e: any) {
			console.error(`[DB] ${e.message}`)
			throw new Error(e.message)
		}
	}
}

const DB = new Database(constants.filesDB_filepath)

export default DB
