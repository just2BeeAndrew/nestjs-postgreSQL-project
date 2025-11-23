import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateQuestionInputDto } from '../../src/modules/quiz-game/api/input-dto/create-question.input-dto';
import { QuestionViewDto } from '../../src/modules/quiz-game/api/view-dto/question.view-dto';
import request from 'supertest';
import { delay } from './delay';

const credentials = Buffer.from('admin:qwerty').toString('base64');

export class QuestionsTestManager {
  constructor(private app: INestApplication) {}

  async createQuestion(
    createQuestion: CreateQuestionInputDto,
  ): Promise<QuestionViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/api/sa/quiz/questions')
      .set('Authorization', 'Basic ' + credentials)
      .send(createQuestion)
      .expect(HttpStatus.CREATED);

    return response.body;
  }

  async createSeveralQuestions(count: number): Promise<QuestionViewDto[]> {
    const questions = [] as QuestionViewDto[];

    for (let i = 0; i < count; ++i) {
      await delay(100);

      const response = await this.createQuestion({
        body: `bodybodyb` + i,
        correctAnswers: [`correctAnswers` + i],
      });
      questions.push(response);
    }
    return questions;
  }
}
