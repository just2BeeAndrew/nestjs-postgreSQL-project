import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { envFilePaths } from './src/dynamic-config-module';
import { existsSync } from 'fs';

for (const envPath of envFilePaths) {
  if (envPath && existsSync(envPath)) {
    config({ path: envPath });
  }
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    join(__dirname, '..', 'domain', 'entity', '**', '*.entity.{ts,js}'),
  ],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
