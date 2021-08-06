import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import pino from 'pino'
import dotenv from 'dotenv'
import fpr from 'fastify-print-routes'
import getDatabase from './db'
import { initBot, BotHolder, createBot } from './initBot'
import { Bot } from './entity/Bot'

import controllers from './controllers'
import { API_V1_PREFIX } from './consts'

dotenv.config()

const { SERVER } = process.env;

if (!SERVER) {
  throw Error('No SERVER!')
}

const start = async () => {

  try {

    const server: FastifyInstance = Fastify({ logger: pino() })

    server.register(fpr)

    server.decorate('db', await getDatabase());
    server.decorate('bots', []);
    server.decorate('serverPath', SERVER);

    controllers(server);

    const rows = await Bot.find()

    server.bots = await Promise.all(rows.map(async (b: Bot) => {
      return createBot({
        token: b.token,
        slug: b.slug
      }, server);
    }))

    await server.listen(<string>process.env.PORT || 8088, <string>process.env.HOST || '127.0.0.1')

  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()