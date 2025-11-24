import { DataSource } from 'typeorm';
import { CreateUserInputDto } from '../../src/modules/user-accounts/api/input-dto/create-users.input-dto';
import { User } from '../../src/modules/user-accounts/domain/entities/user.entity';
import { BcryptService } from '../../src/modules/bcrypt/application/bcrypt.service';
import { TestingModule } from '@nestjs/testing';
import { Game } from '../../src/modules/quiz-game/domain/entity/game.entity';
import { Question } from '../../src/modules/quiz-game/domain/entity/question.entity';
import { Player } from '../../src/modules/quiz-game/domain/entity/player.entity';

export class IntegrationTestManager {
  private bcryptService: BcryptService;

  constructor(
    private dataSource: DataSource,
    private testingModule: TestingModule,
  ) {
    this.bcryptService = testingModule.get<BcryptService>(BcryptService);
  }

  async createUser(createModel: CreateUserInputDto): Promise<User> {
    const userRepo = this.dataSource.getRepository(User);

    const passwordHash = await this.bcryptService.createHash(
      createModel.password,
    );

    const user = User.create({
      login: createModel.login,
      email: createModel.email,
      passwordHash: passwordHash,
    });

    return userRepo.save(user);
  }

  async createSeveralUsers(count: number): Promise<User[]> {
    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      const user = await this.createUser({
        login: `te${i}st`,
        email: `test${i}er@gmail.com`,
        password: '123456789',
      });
      users.push(user);
    }

    return users;
  }

  async createPlayer(user: User) {
    const playerRepo = this.dataSource.getRepository(Player);

    const player = Player.createPlayer(user);

    return playerRepo.save(player);
  }

  async createGame(player: Player) {
    const gameRepo = this.dataSource.getRepository(Game);
    const game = Game.createGame(player);

    return gameRepo.save(game);
  }

  async createConfirmedUser(createModel: CreateUserInputDto): Promise<User> {
    const user = await this.createUser(createModel);

    user.emailConfirmation.isConfirmed = true;

    return await this.dataSource.getRepository(User).save(user);
  }

  async createQuestions(count: number): Promise<Question[]> {
    const questionRepo = this.dataSource.getRepository(Question);
    const questions: Question[] = [];

    for (let i = 0; i < count; i++) {
      const question = Question.create({
        body: `Question ${i + 1}?`,
        correctAnswers: [`answer${i + 1}`, `ans${i + 1}`],
      });
      questions.push(await questionRepo.save(question));
    }

    return questions;
  }

  async createQuestion(data: {
    body: string;
    correctAnswers: string[];
    published?: boolean;
  }): Promise<Question> {
    const questionRepo = this.dataSource.getRepository(Question);

    const question = questionRepo.create({
      body: data.body,
      correctAnswers: data.correctAnswers,
      published: data.published ?? true,
      createdAt: new Date(),
    });

    return await questionRepo.save(question);
  }

  async findGame(gameId: string): Promise<Game | null> {
    const gameRepo = this.dataSource.getRepository(Game);
    return await gameRepo.findOne({
      where: { id: gameId },
      relations: [
        'players',
        'players.user',
        'players.user.accountData',
        'gameQuestions',
        'gameQuestions.question',
      ],
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const userRepo = this.dataSource.getRepository(User);
    return await userRepo.findOne({
      where: { accountData: { email } },
      relations: ['accountData', 'emailConfirmation'],
    });
  }

  async findUserByLogin(login: string): Promise<User | null> {
    const userRepo = this.dataSource.getRepository(User);
    return await userRepo.findOne({
      where: { accountData: { login } },
      relations: ['accountData', 'emailConfirmation'],
    });
  }

  async findUserById(id: string): Promise<User | null> {
    const userRepo = this.dataSource.getRepository(User);
    return await userRepo.findOne({
      where: { id },
      relations: ['accountData', 'emailConfirmation', 'sessions'],
    });
  }

  async checkUserPassword(user: User, password: string): Promise<boolean> {
    return await this.bcryptService.comparePassword({
      password: password,
      hash: user.accountData.passwordHash,
    });
  }
}
