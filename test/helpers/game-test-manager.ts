import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class GameTestManager {
  constructor(private app: INestApplication) {}

  async connection(accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .post('/api/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    return response.body;
  }

  async answer(accessToken: string, answer: string) {
    await request(this.app.getHttpServer())
      .post('/api/pair-game-quiz/pairs/my-current/answers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ answer: `${answer}` })
      .expect(HttpStatus.OK);
  }

  async answerSeveral(accessToken: string) {
    for (let i = 0; i < 5; i++) {
      const answerResponse = await request(this.app.getHttpServer())
        .post('/api/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ answer: `correctAnswers` })
        .expect(HttpStatus.OK);
    }
  }

  async myCurrent(accessToken: string) {
    const response = await request(this.app.getHttpServer())
      .get('/api/pair-game-quiz/pairs/my-current')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    return response.body.firstPlayerProgress.score;
  }
}
