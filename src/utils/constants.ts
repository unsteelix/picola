import dotenv from 'dotenv'
const env: any = dotenv.config()

const PORT = 7400
const filesDB_filepath = './volume/db.json'
const PASS = 'PASS' in env ? env.PASS : '12345678'
const TOKEN = 'TOKEN' in env ? env.TOKEN : 'fpjiaweflawlejofiwefho'

export default {
	PORT,
	filesDB_filepath,
	PASS,
	TOKEN,
}
