import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'path';

const envFilePaths = [
  process.env.ENV_FILE_PATH?.trim() || '',
  join(__dirname, `src`, `env`, `.env.${process.env.NODE_ENV}.local`),
  join(__dirname, `src`, `env`, `.env.${process.env.NODE_ENV}`),
  join(__dirname, `src`, `env`, `.env.production`),
];

config({ path: envFilePaths });

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5400,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    join(__dirname, '..', 'domain', 'entities', '**', '*.entity.{ts,js}'),
  ],
  migrations: [join(__dirname, '..', 'migrations', '*. {ts,js}')],
});
