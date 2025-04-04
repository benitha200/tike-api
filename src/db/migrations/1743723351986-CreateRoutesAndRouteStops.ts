import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoutesAndRouteStops1743723351986 implements MigrationInterface {
    name = 'CreateRoutesAndRouteStops1743723351986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create routes table with updated columns for UUID
        await queryRunner.query(`CREATE TABLE \`routes\` (
            \`id\` varchar(36) NOT NULL, 
            \`idempotency_key\` varchar(255) NOT NULL, 
            \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
            \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
            \`deleted_at\` datetime(6) NULL, 
            \`name\` varchar(255) NOT NULL, 
            \`originStopId\` varchar(36) NOT NULL, 
            \`terminalStopId\` varchar(36) NOT NULL, 
            UNIQUE INDEX \`IDX_d72bb5cc0c39876eb759abe97c\` (\`idempotency_key\`), 
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB`);

        // Create route_stops table
        await queryRunner.query(`CREATE TABLE \`route_stops\` (
            \`id\` varchar(36) NOT NULL, 
            \`idempotency_key\` varchar(255) NOT NULL, 
            \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
            \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
            \`deleted_at\` datetime(6) NULL, 
            \`routeId\` varchar(36) NOT NULL, 
            \`stopId\` varchar(36) NOT NULL, 
            \`stopOrder\` int NOT NULL, 
            \`duration\` int NOT NULL DEFAULT '0', 
            UNIQUE INDEX \`IDX_861628dff6a8a85b3cc0246393\` (\`idempotency_key\`), 
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB`);

        // Add foreign key constraints to route_stops
        await queryRunner.query(`ALTER TABLE \`route_stops\` ADD CONSTRAINT \`FK_352e45964a86c097a435f643004\` FOREIGN KEY (\`routeId\`) REFERENCES \`routes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`route_stops\` ADD CONSTRAINT \`FK_fefca87f7a05a20b8ae86752d1a\` FOREIGN KEY (\`stopId\`) REFERENCES \`locations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_stops\` DROP FOREIGN KEY \`FK_fefca87f7a05a20b8ae86752d1a\``);
        await queryRunner.query(`ALTER TABLE \`route_stops\` DROP FOREIGN KEY \`FK_352e45964a86c097a435f643004\``);
        await queryRunner.query(`DROP INDEX \`IDX_861628dff6a8a85b3cc0246393\` ON \`route_stops\``);
        await queryRunner.query(`DROP TABLE \`route_stops\``);
        await queryRunner.query(`DROP INDEX \`IDX_d72bb5cc0c39876eb759abe97c\` ON \`routes\``);
        await queryRunner.query(`DROP TABLE \`routes\``);
    }
}
