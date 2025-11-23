import { ConfigModule } from '@nestjs/config';
import dbConfig from './core/config/db.config';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

export const envFilePaths = [
  process.env.ENV_FILE_PATH?.trim() || '',
  join(process.cwd(), 'env', `.env.${process.env.NODE_ENV}.local`),
  join(process.cwd(), 'env', `.env.${process.env.NODE_ENV}`),
  join(process.cwd(), 'env', '.env.production'),
];

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: envFilePaths,
  load: [dbConfig],
});
