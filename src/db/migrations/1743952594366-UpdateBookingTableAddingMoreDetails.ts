import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateBookingTableAddingMoreDetails1743952594366 implements MigrationInterface {
    name = '1743952594366-UpdateBookingTableAddingMoreDetails'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD COLUMN \`routeId\` varchar(36) NULL,
            ADD COLUMN \`inStopId\` varchar(36) NULL,
            ADD COLUMN \`outStopId\` varchar(36) NULL,
            ADD COLUMN \`routeName\` varchar(255) NULL,
            ADD COLUMN \`inStopName\` varchar(255) NULL,
            ADD COLUMN \`outStopName\` varchar(255) NULL,
            ADD COLUMN \`departure_time\` varchar(255) NULL,
            ADD COLUMN \`arrival_time\` varchar(255) NULL,
            ADD COLUMN \`arrival_date\` varchar(255) NULL,
            ADD CONSTRAINT \`FK_route_booking\` FOREIGN KEY (\`routeId\`) REFERENCES \`routes\`(\`id\`) ON DELETE SET NULL,
            ADD CONSTRAINT \`FK_in_stop_booking\` FOREIGN KEY (\`inStopId\`) REFERENCES \`route_stops\`(\`id\`) ON DELETE SET NULL,
            ADD CONSTRAINT \`FK_out_stop_booking\` FOREIGN KEY (\`outStopId\`) REFERENCES \`route_stops\`(\`id\`) ON DELETE SET NULL
        `);

        // If you need to backfill data from related tables, you could add update queries here
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            DROP FOREIGN KEY \`FK_route_booking\`,
            DROP FOREIGN KEY \`FK_in_stop_booking\`,
            DROP FOREIGN KEY \`FK_out_stop_booking\`,
            DROP COLUMN \`routeId\`,
            DROP COLUMN \`inStopId\`,
            DROP COLUMN \`outStopId\`,
            DROP COLUMN \`routeName\`,
            DROP COLUMN \`inStopName\`,
            DROP COLUMN \`outStopName\`,
            DROP COLUMN \`departure_time\`,
            DROP COLUMN \`arrival_time\`,
            DROP COLUMN \`arrival_date\`
        `);
    }

}
