import { Column, Entity, PrimaryColumn, BaseEntity } from "typeorm";

@Entity("Bots")
export class Bot extends BaseEntity {
    @PrimaryColumn({unique: true})
    id: number

    @Column()
    token: string

    @Column({unique: true})
    slug: string

}
