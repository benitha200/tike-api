import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalPriceAndDurationToRoute1743850841975 implements MigrationInterface {
  name = "1743850841975-AddTotalPriceAndDurationToRoute";


  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`routes\` ADD \`total_price\` int NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`routes\` ADD \`total_duration\` int NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`routes\` DROP COLUMN \`total_duration\``);
    await queryRunner.query(`ALTER TABLE \`routes\` DROP COLUMN \`total_price\``);
  }
}
