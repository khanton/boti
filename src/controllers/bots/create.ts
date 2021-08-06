import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { API_V1_PREFIX } from "../../consts";
import { Static, Type } from '@sinclair/typebox'
import { Bot } from '../../entity/Bot'
import crypto from 'crypto'
import { createBot } from "../../initBot";

const BotParams = Type.Object({
    token: Type.String()
})

type BotRequestType = Static<typeof BotParams>

const schema = {
    body: BotParams,
    response: {
        200: {
            statusCode: { type: 'number' },
            slug: { type: 'string' }
        }
    }
}

export default function (fastify: FastifyInstance) {

    type BotRequest = FastifyRequest<{
        Body: BotRequestType
    }>

    fastify.post(`${API_V1_PREFIX}/bots`, { schema }, async (req: BotRequest, res: FastifyReply) => {

        const slug = crypto.randomBytes(8).toString('hex');

        const telegramBotHolder = await createBot({
            token: req.body.token,
            slug
        }, fastify)

        await Bot.insert({
            id: telegramBotHolder.id,
            token: req.body.token,
            slug
        });

        fastify.bots.push(telegramBotHolder)

        return {
            statusCode: 201,
            slug
        }
    })

}