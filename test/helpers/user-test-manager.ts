import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersViewDto } from '../../src/modules/user-accounts/api/view-dto/users.view-dto';
import request from 'supertest';
import { delay } from './delay';
import { CreateUserInputDto } from '../../src/modules/user-accounts/api/input-dto/create-users.input-dto';

const credentials = Buffer.from('admin:qwerty').toString('base64');

export class UserTestManager {
  constructor(private app: INestApplication) {}

  async createUser(createModel: CreateUserInputDto): Promise<UsersViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/api/sa/users')
      .set('Authorization', `Basic ${credentials}`)
      .send(createModel)
      .expect(HttpStatus.CREATED);

    return response.body;
  }

  async createSeveralUsers(count: number): Promise<UsersViewDto[]> {
    const usersPromises = [] as UsersViewDto[];

    for (let i = 0; i < count; ++i) {
      await delay(100);

      const response = await this.createUser({
        login: `te` + i + 'st',
        email: `test${i}er@gmail.com`,
        password: `123456789`,
      });
      usersPromises.push(response);
    }
    return usersPromises;
  }

  async loginUser(loginOrEmail: string, password: string): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .set('user-agent', 'test-agent')
      .send({ loginOrEmail:loginOrEmail, password:password })
      .expect(HttpStatus.OK);

    return response.body.accessToken;
  }
}
