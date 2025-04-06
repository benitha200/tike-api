import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTheRoutesStopsTable1743822529267 implements MigrationInterface {
    name = 'CreateTheRoutesStopsTable1743822529267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`routes\` (\`id\` varchar(36) NOT NULL, \`idempotency_key\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, \`departureLocationId\` varchar(36) NULL, \`arrivalLocationId\` varchar(36) NULL, UNIQUE INDEX \`IDX_d72bb5cc0c39876eb759abe97c\` (\`idempotency_key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`);
        await queryRunner.query(`CREATE TABLE \`route_stops\` (\`id\` varchar(36) NOT NULL, \`idempotency_key\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`routeId\` varchar(255) NOT NULL, \`stopName\` varchar(255) NOT NULL, \`stopOrder\` int NOT NULL, \`duration\` int NOT NULL DEFAULT '0', \`price\` int NOT NULL, UNIQUE INDEX \`IDX_861628dff6a8a85b3cc0246393\` (\`idempotency_key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`);
        await queryRunner.query(`ALTER TABLE \`routes\` ADD CONSTRAINT \`FK_b8654f812984327465fabc0fd5e\` FOREIGN KEY (\`departureLocationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`routes\` ADD CONSTRAINT \`FK_e8e9376a7a2b386a61560b1c5de\` FOREIGN KEY (\`arrivalLocationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`route_stops\` ADD CONSTRAINT \`FK_352e45964a86c097a435f643004\` FOREIGN KEY (\`routeId\`) REFERENCES \`routes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_stops\` DROP FOREIGN KEY \`FK_352e45964a86c097a435f643004\``);
        await queryRunner.query(`ALTER TABLE \`routes\` DROP FOREIGN KEY \`FK_e8e9376a7a2b386a61560b1c5de\``);
        await queryRunner.query(`ALTER TABLE \`routes\` DROP FOREIGN KEY \`FK_b8654f812984327465fabc0fd5e\``);
        await queryRunner.query(`DROP INDEX \`IDX_861628dff6a8a85b3cc0246393\` ON \`route_stops\``);
        await queryRunner.query(`DROP TABLE \`route_stops\``);
        await queryRunner.query(`DROP INDEX \`IDX_d72bb5cc0c39876eb759abe97c\` ON \`routes\``);
        await queryRunner.query(`DROP TABLE \`routes\``);
    }

}
