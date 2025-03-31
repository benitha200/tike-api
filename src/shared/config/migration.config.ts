import { DataSource } from 'typeorm';
import 'dotenv/config';

export const migrationDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: ['dist/**/*.entity.js'],  // Same path for entities in the migration
  migrations: ['dist/src/db/migrations/*.js'],  // Path to your migration files
  migrationsTableName: 'migrations',
  synchronize: false,  // For migrations, you usually don't want `synchronize: true`
  logging: false,
});
