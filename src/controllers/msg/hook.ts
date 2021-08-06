import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import createError from "http-errors";
import { API_V1_PREFIX } from "../../consts";
import { Static, Type } from '@sinclair/typebox'
import { Chat } from '../../entity/Chat'

export default function (fastify: FastifyInstance) {

    const MsgParams = Type.Object({
        msg: Type.String(),
    })

    type MsgParamsType = Static<typeof MsgParams>

    const KeyParams = Type.Object({
        key: Type.String(),
    })

    type KeyParamsType = Static<typeof KeyParams>

    const schema = {
        params: KeyParams,
        body: MsgParams,
        response: {
            200: {
                statusCode: { type: 'number' }
            }
        }
    }

    type MsgRequest = FastifyRequest<{
        Params: KeyParamsType,
        Body: MsgParamsType
    }>

    fastify.post(`${API_V1_PREFIX}/msg/:key`, { schema }, async (req: MsgRequest, res: FastifyReply) => {

        const holder = fastify.bots.find((holder) => (holder.slug === req.params.key))

        if (holder) {

            const chats = await Chat.find({ bot_id: holder.id })

            await Promise.all([chats.map((chat: Chat) => {
                return holder.bot.telegram.sendMessage(chat.chat_id, req.body.msg, { parse_mode: "MarkdownV2" })
            })])

            return {
                statusCode: 200
            }

        } else {
            throw createError(404, 'Bot not found!')
        }
    })
}