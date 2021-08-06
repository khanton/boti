import { FastifyInstance } from "fastify/types/instance";

import hookController from "./telegraf/hook"
import botCreate from "./bots/create"
import msg from "./msg/hook"


export default function (fastify: FastifyInstance) {

    hookController(fastify)
    botCreate(fastify)
    msg(fastify)
}