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
import { QuestionsTestManager } from './helpers/questions-test-manager';
import { UserTestManager } from './helpers/user-test-manager';

describe('Quiz (e2e)', () => {
  let app: NestApplication;
  let dataSource: DataSource;
  let questionRepository: Repository<Question>;
  let questionsTestManager: QuestionsTestManager;
  let usersTestManager: UserTestManager;

  const credentials = Buffer.from('admin:qwerty').toString('base64');
  const createQuestionDto: CreateQuestionInputDto = {
    body: 'AreYouSureThatIsString?',
    correctAnswers: ['Yes, I am sure', 'Yes', 'I am sure'],
  };

  beforeAll(async () => {
    const { app: nestApp, testingModule } = await initSettings();
    app = nestApp;
    await app.init();
    questionsTestManager = new QuestionsTestManager(app);
    usersTestManager = new UserTestManager(app);
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

  describe('api/sa/quiz/questions(POST)', () => {
    it('should create question and return status 201 ', async () => {
      return request(app.getHttpServer())
        .post('/api/sa/quiz/questions')
        .set('Authorization', 'Basic ' + credentials)
        .send(createQuestionDto)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('api/sa/quiz/questions(GET)', () => {
    beforeEach(async () => {
      await questionsTestManager.createSeveralQuestions(10);
    });

    it('should return all questions with status 200', async () => {
      return request(app.getHttpServer())
        .get('/api/sa/quiz/questions')
        .set('Authorization', 'Basic ' + credentials)
        .query({
          bodySearchTerm: 'b',
          publishedStatus: 'all',
          sortBy: 'createdAt',
          sortDirection: 'desc',
          pageNumber: 1,
          pageSize: 10,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            pagesCount: expect.any(Number),
            page: expect.any(Number),
            pageSize: 10,
            totalCount: expect.any(Number),
            items: expect.any(Array),
          });

          expect(res.body.items.length).toBeLessThanOrEqual(10);

          if (res.body.items.length > 0) {
            const item = res.body.items[0];
            expect(item).toMatchObject({
              id: expect.any(String),
              body: expect.any(String),
              correctAnswers: expect.any(Array),
              published: expect.any(Boolean),
              createdAt: expect.any(String),
            });
            expect(
              item.updatedAt === null || typeof item.updatedAt === 'string',
            ).toBe(true);
          }
        });
    });
  });

  describe('api/pair-game-quiz/pairs/my-current', () => {
    it('should return status 400 ', async () => {
      const users = await usersTestManager.createSeveralUsers(2);
      console.log('Результат: Создано пользователей:', users.length);
      console.log('User1:', users[0].login);
      console.log('User2:', users[1].login);

      const questions = await questionsTestManager.createSeveralQuestions(5);
      console.log('Результат: Создано вопросов:', questions.length);

      for (const question of questions) {
        await questionsTestManager.publishQuestion(question.id)
      }
      console.log('Результат: Все вопросы опубликованы')

      const userAccessToken1 = await usersTestManager.loginUser(users[0].login, '123456789')
      console.log('Результат: User1 залогинен, токен получен: ', userAccessToken1.substring(0));

      const userAccessToken2 = await usersTestManager.loginUser(users[1].login, '123456789')
      console.log('Результат: User2 залогинен, токен получен: ', userAccessToken2.substring(0));
    });
  });
});
