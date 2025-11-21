import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';
import { DataSource } from 'typeorm';
import { deleteAllData } from './helpers/delete-all-data';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'src/env/.env.testing' });

describe('auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();
    appSetup(app);
    await app.init();

    dataSource = module.get<DataSource>(getDataSourceToken());

    await deleteAllData(app);
  });

  afterEach(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    await app.close();
  });

  it('should initialize application', () => {
    expect(app).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(dataSource.isInitialized).toBe(true);
  });
});
