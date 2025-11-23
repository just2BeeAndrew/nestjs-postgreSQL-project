import { initAppModule } from '../../src/init-app-module';
import { Test, TestingModule } from '@nestjs/testing';
import { NestApplication } from '@nestjs/core';
import { appSetup } from '../../src/setup/app.setup';
import { LoggerService } from '@nestjs/common';

export const initSettings = async () => {
  const dynamicAppModule = await initAppModule();

  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [dynamicAppModule],
  }).compile();

  const app: NestApplication = testingModule.createNestApplication();
  appSetup(app);
  app.useLogger(new TestLogger());

  await app.init();

  return { app, testingModule };
};

class TestLogger implements LoggerService {
  log(message: string) {}
  error(message: string, trace: string) {}
  warn(message: string) {}
  debug(message: string) {}
  verbose(message: string) {}
}
