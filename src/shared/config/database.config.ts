import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/db/migrations/*.js'],
  migrationsTableName: 'migrations',
  logging: false,
  synchronize: true,
};
