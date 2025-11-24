import { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import {
  FindGameByIdQuery,
  FindGameByIdQueryHandler,
} from './find-game-by-id.query-handler';
import { IntegrationTestManager } from '../../../../../test/helpers/integration-test-manager';
import {
  clearDatabase,
  initIntegrationTest,
} from '../../../../../test/helpers/Integration-test.init-settings';

describe('FindGameByIdQuery', () => {
  let testingModule: TestingModule;
  let dataSource: DataSource;
  let queryHandler: FindGameByIdQueryHandler;
  let testManager: IntegrationTestManager;

  beforeAll(async () => {
    const setup = await initIntegrationTest();
    testingModule = setup.testingModule;
    dataSource = setup.dataSource;
    queryHandler = testingModule.get<FindGameByIdQueryHandler>(
      FindGameByIdQueryHandler
    );
    testManager = new IntegrationTestManager(dataSource, testingModule);
  });

  afterAll(async () => {
    await testingModule.close();
    ``;
  });

  afterEach(async () => {
    await clearDatabase(dataSource);
  });

  describe('successful ', () => {
    it('should return pending game with only first player', async () => {
      const user = await testManager.createSeveralUsers(1);
      console.log(user);

      const player = await testManager.createPlayer(user[0]);
      console.log(player);

      const game = await testManager.createGame(player);
      console.log(game);

      const query = new FindGameByIdQuery(game.id, user[0].id);
      const result = await queryHandler.execute(query);

      expect(result).toBeDefined();
      expect(result.id).toBe(game.id);
      expect(result.firstPlayerProgress).toBeDefined();
      expect(result.firstPlayerProgress.player.id).toBe(user[0].id);
      expect(result.secondPlayerProgress).toBeNull();
    });
  });
});
