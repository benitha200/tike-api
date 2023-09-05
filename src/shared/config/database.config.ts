import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  database: 'tike',
  username: 'root',
  password: '123login',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/db/migrations/*.js'],
  migrationsTableName: 'migrations',
  logging: false,
  synchronize: true,
};
