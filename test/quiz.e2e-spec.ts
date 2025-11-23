import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { DataSource, Repository } from 'typeorm';
import { Question } from '../src/modules/quiz-game/domain/entity/question.entity';
import { deleteAllData } from './helpers/delete-all-data';
import { CreateQuestionInputDto } from '../src/modules/quiz-game/api/input-dto/create-question.input-dto';
import request from 'supertest';
import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/env/.env.testing` });
import { initSettings } from './helpers/init-settings';

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
    const { app: nestApp, testingModule } = await initSettings();

    app = nestApp;

    await app.init();

    dataSource = testingModule.get(DataSource);

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
