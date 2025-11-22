import { HttpStatus, LoggerService } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';
import { DataSource, Repository } from 'typeorm';
import { Question } from '../src/modules/quiz-game/domain/entity/question.entity';
import { deleteAllData } from './helpers/delete-all-data';
import { CreateQuestionInputDto } from '../src/modules/quiz-game/api/input-dto/create-question.input-dto';
import request from 'supertest';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'src/env/.env.testing' });

class TestLogger implements LoggerService {
  log(message: string) {}
  error(message: string, trace: string) {}
  warn(message: string) {}
  debug(message: string) {}
  verbose(message: string) {}
}

describe('Quiz (e2e)', () => {
  let app: NestApplication;
  let dataSource: DataSource;
  let questionRepository: Repository<Question>;

  const credentials = Buffer.from('admin:qwerty').toString('base64');
  const createQuestionDto: CreateQuestionInputDto = {
    body: 'AreYouSureThatIsString?',
    correctAnswers: ['Yes, I am sure', 'Yes', 'I am sure'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    app.useLogger(new TestLogger());
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    questionRepository = dataSource.getRepository(Question);

    await dataSource.synchronize(false);
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  afterEach(async () => {});

  it('should create question and return status 201 ', async () => {
    return await request(app.getHttpServer())
      .post('/api/sa/quiz/questions')
      .set('Authorization', 'Basic ' + credentials)
      .send(createQuestionDto)
      .expect(HttpStatus.CREATED);
  });


});
