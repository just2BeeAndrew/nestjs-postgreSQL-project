import { INestApplication, LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';
import { DataSource, Repository } from 'typeorm';
import { Blog } from '../src/modules/bloggers-platform/domain/entities/blog.entity';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'src/env/.env.testing' });

class TestLogger implements LoggerService {
  log(message: string) {}
  error(message: string, trace: string) {}
  warn(message: string) {}
  debug(message: string) {}
  verbose(message: string) {}
}

describe('Blogs(e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let blogRepository: Repository<Blog>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    app.useLogger(new TestLogger());
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    blogRepository = dataSource.getRepository(Blog);

    await dataSource.synchronize(false);
  });

  beforeEach(async () => {});

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  afterEach(async () => {});

  it('should run basic test', () => {
    expect(true).toBe(true);
  });
});
