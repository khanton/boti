import { Telegraf, Context } from 'telegraf'
import { Members, MyChatMember } from './interface';
import { User } from 'telegraf/typings/core/types/typegram';


export default function bot(token: string, db): Telegraf {
  const bot: Telegraf = new Telegraf(token);

  bot.on('text', async (ctx) => {
    return ctx.reply('Hello')
  })

  bot.on('my_chat_member', async function (ctx: Context) {

    const status: MyChatMember = ctx.update as unknown as MyChatMember;

    const user: User = status.my_chat_member.new_chat_member.user;
    const newState: string = status.my_chat_member.new_chat_member.status;

    if (ctx.botInfo.id === user.id) {
      switch (newState) {
        case Members.member:

          try {
            await db.run('INSERT OR IGNORE INTO chats(chat_id) VALUES (:chat_id)', {
              ':chat_id': ctx.chat.id
            })
          }
          catch (e) {
            console.error(e)
          }

          break;
        case Members.kicked:
        case Members.left:

          try {
            await db.run('DELETE FROM chats WHERE chat_id = (:chat_id)', {
              ':chat_id': ctx.chat.id
            })
          }
          catch (e) {
            console.error(e)
          }

          break;
      }
    }

  });



  bot.command('start', async (ctx) => {


    return ctx.reply('Привет !')
  })

  return bot;
}
