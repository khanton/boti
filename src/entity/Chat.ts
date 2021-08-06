import { Entity, BaseEntity, PrimaryColumn } from "typeorm";

@Entity("Chats")
export class Chat extends BaseEntity {
    @PrimaryColumn()
    bot_id: number

    @PrimaryColumn()
    chat_id: number

}
