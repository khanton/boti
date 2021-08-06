import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class initial1627837053348 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(new Table({
            name: "bots",
            columns: [
                { name: "id", type: 'integer', isPrimary: true, isUnique: true },
                { name: "token", type: "varchar" },
                { name: "slug", type: "string", isUnique: true }
            ]
        }), true)

        await queryRunner.createIndex("bots", new TableIndex({
            columnNames: ["user_name", "bot_name", "token"],
            isUnique: true
        }))

        await queryRunner.createTable(new Table({
            name: 'chats',
            columns: [
                { name: 'bot_id', type: 'integer' },
                { name: 'chat_id', type: 'integer' }
            ]
        }))

        await queryRunner.createPrimaryKey('chats', ['bot_id', 'chat_id']);

        await queryRunner.createForeignKey('chats', new TableForeignKey({
            columnNames: ['bot_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'bots',
            onDelete: 'CASCADE'
        }))

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('bots')
        await queryRunner.dropTable('chats')
    }

}
