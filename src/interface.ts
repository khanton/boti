import { Chat, User } from "telegraf/typings/core/types/typegram";

// export interface Chat {
//     id: string,
//     first_name: string,
//     last_name: string,
//     username: string,
//     type: string
// }

// export interface User {
//     id: number,
//     is_bot: boolean,
//     first_name: string,
//     username: string
// }

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
