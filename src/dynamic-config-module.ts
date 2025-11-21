import { ConfigModule } from '@nestjs/config';
import dbConfig from './core/config/db.config';
import {join} from 'path';
import * as dotenv from 'dotenv'
dotenv.config();

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim() || '',
    join(__dirname, '..', 'env', `.env.${process.env.NODE_ENV}.local`),
    join(__dirname, '..', 'env', `.env.${process.env.NODE_ENV}`),
    join(__dirname, '..', 'env', '.env.production'),
  ],
  load: [dbConfig]
});

