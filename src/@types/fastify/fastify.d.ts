import * as fastify from "fastify";
import { Telegraf } from "telegraf";
import { Database } from 'sqlite3';

declare module "fastify" {
  export interface FastifyInstance {
    bot: Telegraf;
    db: Database;
  }
}
