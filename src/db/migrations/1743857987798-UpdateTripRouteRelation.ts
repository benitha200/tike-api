import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTripEntityWithRouteFields1675702575744 implements MigrationInterface {
  name = 'UpdateTripEntityWithRouteFields1675702575744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraints for `departure_location` and `arrival_location`
    await queryRunner.query(`
      ALTER TABLE \`trips\`
    `);

    // Drop the `departure_location` and `arrival_location` columns
    await queryRunner.query(`
      ALTER TABLE \`trips\`
      DROP COLUMN \`departure_location\`,
      DROP COLUMN \`arrival_location\`;
    `);

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

    // Re-add the `departure_location` and `arrival_location` columns and their foreign key constraints
    await queryRunner.query(`
      ALTER TABLE \`trips\`
      ADD \`departure_location\` CHAR(36),
      ADD \`arrival_location\` CHAR(36);
    `);

    await queryRunner.query(`
      ALTER TABLE \`trips\`
    `);

    // Re-add the `price` column
    await queryRunner.query(`
      ALTER TABLE \`trips\`
      ADD \`price\` INTEGER;
    `);
  }
}
