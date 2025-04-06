import { MigrationInterface, QueryRunner } from "typeorm"

export class InitialMigration1743419887498 implements MigrationInterface {
    name = '1743419887498-InitialMigration'

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
