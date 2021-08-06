import { Telegraf, Context } from 'telegraf'
import { Members, MyChatMember } from './interface';
import { User } from 'telegraf/typings/core/types/typegram';
import { Connection } from 'typeorm';
import { FastifyInstance } from 'fastify';
import { API_V1_PREFIX } from './consts';
import { Chat } from './entity/Chat'

export interface BotHolder {
  id: number,
  token: string,
  slug: string,
  bot: Telegraf
}

interface BotContext extends Context {
  id: number
}

export async function initBot(token: string): Promise<Telegraf> {

  const bot: Telegraf = new Telegraf<BotContext>(token);


  bot.use((ctx: BotContext, next) => {
//    ctx.id = id
    return next()
  })

  // bot.on('text', async (ctx) => {
  //   return ctx.reply('Hello')
  // })

  bot.on('my_chat_member', async function (ctx: Context) {

    const status: MyChatMember = ctx.update as unknown as MyChatMember;

    const user: User = status.my_chat_member.new_chat_member.user;
    const newState: string = status.my_chat_member.new_chat_member.status;

    if (ctx.botInfo.id === user.id) {
      switch (newState) {
        case Members.member:

          try {
            const chat = new Chat();
            chat.bot_id = ctx.botInfo.id
            chat.chat_id = ctx.chat.id

            await chat.save()
          } catch (e) {
            console.log(e.message);
          }

          break;
        case Members.kicked:
        case Members.left:

          try {
            const chat = new Chat();
            chat.bot_id = ctx.botInfo.id
            chat.chat_id = ctx.chat.id

            await chat.remove()
          } catch (e) {
            console.log(e.message);
          }

          break;
      }
    }

  });

  bot.start(async (ctx: Context) => {

    try {
      const chat = new Chat();
      chat.bot_id = ctx.botInfo.id
      chat.chat_id = ctx.chat.id

      await chat.save()
    } catch (e) {
      console.log(e.message);
    }

    return ctx.reply(`Привет ! Мой id: ${ctx.botInfo.id}`)
  })

  return bot;
}

export interface CreateBotParams {
  token: string,
  slug: string,
}

export async function createBot(param: CreateBotParams, server: FastifyInstance): Promise<BotHolder> {

  const bot = await initBot(param.token);

  const me =  await bot.telegram.getMe();

  server.log.info(`Start bot: ${me.first_name} with name: ${me.username} and token: ${param.token}`)

  
  const holder: BotHolder = {
    id: me.id,
    token: bot.secretPathComponent(),
    slug: param.slug,
    bot
  }

  const SECRET_PATH: string = `${API_V1_PREFIX}/telegraf/${bot.secretPathComponent()}`

  Promise.all([bot.telegram.setWebhook(`${server.serverPath}${SECRET_PATH}`)]);

  return holder;

}
