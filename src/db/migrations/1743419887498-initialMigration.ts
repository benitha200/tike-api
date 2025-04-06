import { MigrationInterface, QueryRunner } from "typeorm"

export class InitialMigration1743419887498 implements MigrationInterface {
    name = 'InitialMigration1743419887498'

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
