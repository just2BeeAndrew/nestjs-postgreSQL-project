import { initAppModule } from '../../src/init-app-module';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

export const initIntegrationTest = async () => {
  const dynamicAppModule = await initAppModule();

  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [dynamicAppModule],
  }).compile();

  const dataSource = testingModule.get<DataSource>(DataSource);

  return { testingModule, dataSource };
};

export const clearDatabase = async (dataSource: DataSource): Promise<void> => {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
  }
};
