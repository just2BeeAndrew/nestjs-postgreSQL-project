import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { DomainExceptionFactory } from '../../../../core/exception/filters/domain-exception-factory';
import { Game } from '../../domain/entity/game.entity';
import { Player } from '../../domain/entity/player.entity';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { QuestionRepository } from '../../infrastructure/question.repository';
import { GameQuestion } from '../../domain/entity/game-question.entity';

export class ConnectionCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectionCommand)
export class ConnectionUseCase implements ICommandHandler<ConnectionCommand> {
  constructor(
    private gameRepository: GameRepository,
    private usersRepository: UsersRepository,
    private playersRepository: PlayerRepository,
    private questionRepository: QuestionRepository,
  ) {}

  async execute({ userId }: ConnectionCommand) {
    const isActivePlayer = await this.playersRepository.isActivePlayer(userId);
    if (isActivePlayer) {
      throw DomainExceptionFactory.forbidden();
    }
    //нашёл пользователя для создания связи
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw DomainExceptionFactory.notFound();
    }

    //создал игрока
    const player = Player.createPlayer(user);
    await this.playersRepository.savePlayer(player);

    //выбрал 5 случайных вопросов для игры
    const question = await this.questionRepository.getRandomQuestion();
    const gameQuestions = GameQuestion.createGameQuestions(question);

    //проверяю наличие игры
    let game = await this.gameRepository.findGamePending();

    //если игры нет, то создаю игру
    if (!game) {
      game = Game.createGame(player);
      await this.gameRepository.saveGame(game);
    } else {
      game.addPlayer(player);
      if (game.players.length === 2) {
        game.startGame(gameQuestions);
      }
      await this.gameRepository.saveGame(game);
    }

    return game.id;
  }
}
