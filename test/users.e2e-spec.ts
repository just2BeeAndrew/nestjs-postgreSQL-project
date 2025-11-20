import { HttpStatus, INestApplication, LoggerService } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';
import request from 'supertest';
import { User } from '../src/modules/user-accounts/domain/entities/user.entity';
import { AccountData } from '../src/modules/user-accounts/domain/entities/account-data.entity';
import { UserTestManager } from './helpers/user-test-manager';
import { deleteAllData } from './helpers/delete-all-data';

class TestLogger implements LoggerService {
  log(message: string) {}
  error(message: string, trace: string) {}
  warn(message: string) {}
  debug(message: string) {}
  verbose(message: string) {}
}

describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let accountDataRepository: Repository<AccountData>;
  let userTestManager: UserTestManager;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    app.useLogger(new TestLogger());
    await app.init();

    userTestManager = new UserTestManager(app);

    dataSource = moduleFixture.get(DataSource);

    userRepository = dataSource.getRepository(User);
    accountDataRepository = dataSource.getRepository(AccountData);

    await dataSource.synchronize(true);
  });

  beforeEach(async () => {});

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  afterEach(async () => {});

  describe('/users (POST)', () => {
    const credentials = Buffer.from('admin:qwerty').toString('base64');
    const createUserDto = {
      login: 'Str1n9',
      password: '5tr1n9',
      email: 'andrew.dudal.1997@gmail.com',
    };

    it('should create user and return 201', async () => {
      return await request(app.getHttpServer())
        .post('/api/sa/users')
        .set('Authorization', `Basic ${credentials}`)
        .send(createUserDto)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('api/sa/users (GET)', () => {
    beforeEach(async () => {
      await deleteAllData(app); // Изменено: this.app -> app
      await userTestManager.createSeveralUsers(10);
    });

    it('should return paginated users with status 200', () => {
      return request(app.getHttpServer())
        .get('/api/sa/users')
        .query({
          pageSize: 15,
          pageNumber: 1,
          searchLoginTerm: 'st',
          searchEmailTerm: '.com',
          sortDirection: 'asc',
          sortBy: 'login',
        })
        .auth('admin', 'qwerty')
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            pagesCount: expect.any(Number),
            page: expect.any(Number),
            pageSize: 15,
            totalCount: expect.any(Number),
            items: expect.any(Array),
          });

          expect(res.body.items.length).toBeLessThanOrEqual(15);

          if (res.body.items.length > 0) {
            expect(res.body.items[0]).toMatchObject({
              id: expect.any(String),
              login: expect.any(String),
              email: expect.any(String),
              createdAt: expect.any(String),
            });
          }
        });
    });

    it('should filter users by login term', () => {
      return request(app.getHttpServer())
        .get('/api/sa/users')
        .query({
          searchLoginTerm: 'test', // Изменено на 'test' чтобы соответствовать созданным юзерам
        })
        .auth('admin', 'qwerty')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeInstanceOf(Array);
          res.body.items.forEach((user) => {
            expect(user.login.toLowerCase()).toContain('test');
          });
        });
    });

    it('should filter users by email term', () => {
      return request(app.getHttpServer())
        .get('/api/sa/users')
        .query({
          searchEmailTerm: '@gmail.com', // Изменено на @gmail.com
        })
        .expect(200)
        .auth('admin', 'qwerty')
        .expect((res) => {
          expect(res.body.items).toBeInstanceOf(Array);
          res.body.items.forEach((user) => {
            expect(user.email.toLowerCase()).toContain('@gmail.com');
          });
        });
    });

    it('should sort users by login in ascending order', () => {
      return request(app.getHttpServer())
        .get('/api/sa/users')
        .query({
          sortBy: 'login',
          sortDirection: 'asc',
        })
        .auth('admin', 'qwerty')
        .expect(200)
        .expect((res) => {
          const logins = res.body.items.map((user) => user.login);
          const sortedLogins = [...logins].sort();

          expect(logins).toEqual(sortedLogins);
        });
    });

    it('should handle pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/api/sa/users')
        .query({
          pageSize: 5,
          pageNumber: 2,
        })
        .auth('admin', 'qwerty')
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(2);
          expect(res.body.pageSize).toBe(5);
          expect(res.body.items.length).toBeLessThanOrEqual(5);
        });
    });
  });
});
