import Fastify, { fastify, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import pino from 'pino'
import dotenv from 'dotenv'
import fpr from 'fastify-print-routes'
import { Update } from 'telegraf/typings/core/types/typegram'
import bot from './bot';
import getDatabase from './db'

dotenv.config()

const API_V1_PREFIX: string = '/api/v1'

const { TOKEN, SERVER, DB_PATH } = process.env;

if (!TOKEN) {
  throw Error('No bot TOKEN!')
}

if (!SERVER) {
  throw Error('No SERVER!')
}

if (!DB_PATH) {
  throw Error('No DB_PATH!')
}


const start = async () => {

  try {

    const server: FastifyInstance = Fastify({ logger: pino() })

    server.log.info({ msg: `Start with bot token: ${TOKEN}` })

    server.register(fpr)

    const db = await getDatabase(DB_PATH || 'db')
    server.decorate('db', db);
    server.decorate('bot', bot(TOKEN, db))

    const SECRET_PATH: string = `${API_V1_PREFIX}/telegraf/${server.bot.secretPathComponent()}`

    server.post(SECRET_PATH, (req: FastifyRequest, res: FastifyReply) => {
      server.bot.handleUpdate(req.body as Update, res.raw);
    })

    type MsgRequest = FastifyRequest<{
      Body: { msg: string }
    }>

    server.post(`${API_V1_PREFIX}/msg`, async (req: MsgRequest, reply) => {
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

    await server.bot.telegram.setWebhook(`${SERVER}${SECRET_PATH}`)
    await server.listen(<string>process.env.PORT || 8088, <string>process.env.HOST || '127.0.0.1')
    
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()