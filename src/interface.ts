import { Chat, User } from "telegraf/typings/core/types/typegram";
export interface MyChatMember {
    update_id: string,
    my_chat_member: {
        chat: Chat,
        old_chat_member: {
            user: User,
            status: string
        },
        new_chat_member: {
            user: User,
            status: string
        }
    }
}

export enum Members {
    kicked = 'kicked',
    member = 'member',
    left = 'left'
}
