import Fastify, { fastify, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import pino from 'pino'
import dotenv from 'dotenv'
import fpr from 'fastify-print-routes'
import { Update } from 'telegraf/typings/core/types/typegram'
import bot from './bot';
import getDatabase from './db'
// import sqlite3 from 'sqlite3'

dotenv.config()

const { TOKEN, NGROK } = process.env;

if (!TOKEN) {
  throw Error('No token!')
}

if (NGROK === undefined) {
  throw Error('No ngrok server!')
}

const start = async () => {

  const server: FastifyInstance = Fastify({ logger: pino() })

  server.log.info({ msg: `Bot Token: ${TOKEN}` })

  server.register(fpr);

  try {
    const db = await getDatabase()
    server.decorate('db', db);
    server.decorate('bot', bot(TOKEN, db))
  } catch(e) {
    console.error(e);
    process.exit(200);
  }

  const SECRET_PATH: string = `/telegraf/${server.bot.secretPathComponent()}`

  server.post(SECRET_PATH, (req: FastifyRequest, res: FastifyReply) => {
    server.bot.handleUpdate(req.body as Update, res.raw);
  })

  server.bot.telegram.setWebhook(`${NGROK}${SECRET_PATH}`)

  type MsgRequest = FastifyRequest<{
    Body: { msg: string }
  }>

  server.post('/msg', async (req: MsgRequest, reply) => {

    interface Row {
      chat_id: string
    }

    server.db.each('select chat_id from chats', (err, row: Row) => {
      if (err) {
        throw err;
      }

      server.bot.telegram.sendMessage(row.chat_id, req.body.msg)
    })
  
    return { status: 'Success!' }
  })

  try {
    await server.listen(process.env.PORT as string)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()