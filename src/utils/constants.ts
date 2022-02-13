import dotenv from 'dotenv'
const env = dotenv.config()

const PORT = 7400
const filesDB_filepath = './volume/db.json'
const PASS = env.PASS || '12345678'
const TOKEN = env.TOKEN || 'fpjiaweflawlejofiwefho'

export default {
	PORT,
	filesDB_filepath,
	PASS,
	TOKEN
}
