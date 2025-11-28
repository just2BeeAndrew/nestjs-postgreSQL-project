import { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ConnectionCommand, ConnectionUseCase } from './connection.usecase';
import {
  clearDatabase,
  initIntegrationTest,
} from '../../../../../test/helpers/Integration-test.init-settings';
import { IntegrationTestManager } from '../../../../../test/helpers/integration-test-manager';
import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/env/.env.testing` });

describe('ConnectionUseCase', () => {
  let testingModule: TestingModule;
  let dataSource: DataSource;
  let useCase: ConnectionUseCase;
  let testManager: IntegrationTestManager;

  beforeAll(async () => {
    const setup = await initIntegrationTest();
    testingModule = setup.testingModule;
    dataSource = setup.dataSource;
    useCase = testingModule.get<ConnectionUseCase>(ConnectionUseCase);

    testManager = new IntegrationTestManager(dataSource, testingModule);
  });

  afterAll(async () => {
    await testingModule.close();
  });

  afterEach(async () => {
    await clearDatabase(dataSource);
  });

  it('should be connect first player', async () => {
    const user = await testManager.createSeveralUsers(1);
    await testManager.createQuestions(10);

    const gameId = await useCase.execute(new ConnectionCommand(user[0].id));

    expect(gameId).toBeDefined();

    const game = await testManager.findGame(gameId);
    expect(game).toBeDefined();
    expect(game).not.toBeNull();
    expect(game!.players).toHaveLength(1);
    expect(game!.players[0].user.id).toBe(user[0].id);
    expect(game!.status).toBe('PendingSecondPlayer');
  });

  it('should be connected two players', async () => {
    const  users = await testManager.createSeveralUsers(2);
    await testManager.createQuestions(10);

    await useCase.execute(new ConnectionCommand(users[0].id));
    const gameId = await useCase.execute(new ConnectionCommand(users[1].id));

    expect(gameId).toBeDefined();

    const game = await testManager.findGame(gameId);
    expect(game).toBeDefined();
    expect(game).not.toBeNull();
    expect(game!.players).toHaveLength(2);
    expect(game!.players[0].user.id).toBe(users[0].id);
    expect(game!.players[1].user.id).toBe(users[1].id);
    expect(game!.status).toBe('Active');
  })
});
