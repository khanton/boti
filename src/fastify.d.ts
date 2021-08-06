import * as fastify from "fastify"
import { Telegraf } from "telegraf"
import { Connection } from 'typeorm'
import { BotHolder } from "./initBot"


declare module "fastify" {
  export interface FastifyInstance {
    bots: BotHolder[];
    db: Connection;
    serverPath: string;
  }
}
