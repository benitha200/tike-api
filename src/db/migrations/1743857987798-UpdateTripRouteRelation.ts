import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTripEntityWithRouteFields1675702575744 implements MigrationInterface {
  name = 'UpdateTripEntityWithRouteFields1675702575744';

  public async up(queryRunner: QueryRunner): Promise<void> {


    // Add the `route` column to the `trips` table
    await queryRunner.query(`
      ALTER TABLE \`trips\`
      ADD \`route\` CHAR(36);
    `);

    // Add the foreign key constraint for `route` referencing `id` on `routes` table
    await queryRunner.query(`
      ALTER TABLE \`trips\`
      ADD CONSTRAINT \`FK_route\` FOREIGN KEY (\`route\`) REFERENCES \`routes\`(\`id\`) ON DELETE SET NULL;
    `);

    // Drop the `price` column as it will be managed by the route now
    await queryRunner.query(`
      ALTER TABLE \`trips\`
      DROP COLUMN \`price\`;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraint for `route`
    await queryRunner.query(`
      ALTER TABLE \`trips\`
      DROP CONSTRAINT \`FK_route\`;
    `);

    // Drop the `route` column
    await queryRunner.query(`
      ALTER TABLE \`trips\`
      DROP COLUMN \`route\`;
    `);


    // Re-add the `price` column
    await queryRunner.query(`
      ALTER TABLE \`trips\`
      ADD \`price\` INTEGER;
    `);
  }
}
