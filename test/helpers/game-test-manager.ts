import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class GameTestManager {
  constructor(private app: INestApplication) {
  }

  async connection(accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .post('/api/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    return response.body
  }

  async answerSeveral(accessToken: string) {
    for (let i = 0; i < 5; i++) {
      const answerResponse = await request(this.app.getHttpServer())
        .post('/api/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ answer: `correctAnswers${i}` })
        .expect(HttpStatus.OK);
      console.log(`Вопрос ${i + 1}: User ответил`);
      console.log('  - Question ID:', answerResponse.body.questionId);
      console.log('  - Answer:', answerResponse.body.answer);
      console.log('  - Answer Status:', answerResponse.body.answerStatus);
      console.log('  - Added At:', answerResponse.body.addedAt);
    }
  }
}