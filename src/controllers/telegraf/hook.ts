import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import createError from "http-errors";
import { Update } from 'telegraf/typings/core/types/typegram'
import { API_V1_PREFIX } from "../../consts";

export default function (fastify: FastifyInstance) {

    type BotRequest = FastifyRequest<{
        Params: { key: string }
    }>

    fastify.post(`${API_V1_PREFIX}/telegraf/:key`, (req: BotRequest, res: FastifyReply) => {

        if (!req.params.key) {
            throw createError(400, 'Bad request')
        }

        const holder = fastify.bots.find((holder) => (holder.token === req.params.key))

        if (holder) {
            holder.bot.handleUpdate(req.body as Update, res.raw)
        } else {
            throw createError(404, 'Bot not found!')
        }
    })
}