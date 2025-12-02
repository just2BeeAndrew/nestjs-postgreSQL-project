import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { DomainExceptionFactory } from '../../../../core/exception/filters/domain-exception-factory';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { Answer, AnswerStatus } from '../../domain/entity/answer.entity';
import { GameQuestionRepository } from '../../infrastructure/game-question.repository';
import { Game, GameStatus } from '../../domain/entity/game.entity';
import { QUESTION_COUNT } from '../../constants/questions-count';
import { GameResultEnum, Player } from '../../domain/entity/player.entity';
import { SchedulerRegistry } from '@nestjs/schedule';

export class AnswerCommand {
  constructor(
    public userId: string,
    public answer: string,
  ) {}
}

@CommandHandler(AnswerCommand)
export class AnswerUseCase implements ICommandHandler<AnswerCommand> {
  private readonly AUTO_FINISH_DELAY_MS = 10000;
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameQuestionRepository: GameQuestionRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async execute(command: AnswerCommand) {
    // Находим игрока
    const player = await this.playerRepository.findPlayer(command.userId);
    if (!player) {
      throw DomainExceptionFactory.forbidden();
    }
    // работаю только через экземпляр игры,
    // нахожу игру
    const game = await this.gameRepository.findGameById(player.game.id); //достать игру через репо
    if (!game) {
      throw DomainExceptionFactory.forbidden();
    }
    const currentPlayer = game.players.find((p) => p.id === player.id);
    if (!currentPlayer) {
      throw DomainExceptionFactory.forbidden();
    }
    const answersCount = currentPlayer.answers.length;

    // 403: If current user is not inside active pair
    if (game.status !== GameStatus.Active) {
      throw DomainExceptionFactory.forbidden();
    }

    // 403: or user is in active pair but has already answered to all questions
    if (answersCount >= QUESTION_COUNT) {
      throw DomainExceptionFactory.forbidden();
    }
    // Определяем правильность ответа
    const currentQuestion = game.gameQuestions[answersCount];
    const answerStatus = currentQuestion.question.correctAnswers.includes(
      command.answer,
    )
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;

    // Создаём и сохраняем ответ
    const answer = Answer.createAnswer({
      questionId: currentQuestion.question.id,
      playerAnswer: command.answer,
      answerStatus: answerStatus,
      playerId: player.id,
    });

    const savedAnswer = await this.answerRepository.saveAnswer(answer);

    // Начисляем очко за правильный ответ
    if (answerStatus === AnswerStatus.Correct) {
      player.addScore();
      await this.playerRepository.savePlayer(player);
    }

    // Обновляем количество ответов
    const newAnswersCount = answersCount + 1;

    // Проверяем, завершил ли игрок все вопросы
    if (newAnswersCount === QUESTION_COUNT) {
      const otherPlayer = game.players.find((p) => p.id !== player.id);

      if (otherPlayer) {
        const otherPlayerAnswersCount =
          await this.answerRepository.countAnswers(otherPlayer.id, game.id);
        // Если оба игрока завершили - завершаем игру
        if (otherPlayerAnswersCount === QUESTION_COUNT) {
          const timeoutName = `autoFinishGame: ${game.id}`;
          if (this.schedulerRegistry.doesExist('timeout', timeoutName)) {
            const timeout = this.schedulerRegistry.getTimeout(timeoutName);
            clearTimeout(timeout);
            this.schedulerRegistry.deleteTimeout(timeoutName);
          }

          await this.countBonusAndFinishGame(game, player, otherPlayer);
        } else {
          await this.autoFinishGame(game.id, otherPlayer.id, player.id);
        }
      }
    }

    return {
      questionId: savedAnswer.questionId,
      answerStatus: savedAnswer.answerStatus,
      addedAt: savedAnswer.createdAt.toISOString(),
    };
  }
  private async countBonusAndFinishGame(
    game: Game,
    player: Player,
    otherPlayer: Player,
  ) {
    const currentPlayerLastAnswers =
      player.answers[QUESTION_COUNT - 1].createdAt;
    const otherPlayerLastAnswers =
      otherPlayer.answers[QUESTION_COUNT - 1].createdAt;

    const currentPlayerHasCorrectAnswers =
      await this.answerRepository.countCorrectAnswers(player.id, game.id);

    const otherPlayerHasCorrectAnswers =
      await this.answerRepository.countCorrectAnswers(otherPlayer.id, game.id);

    if (
      currentPlayerLastAnswers < otherPlayerLastAnswers &&
      currentPlayerHasCorrectAnswers
    ) {
      player.addScore();
    } else if (
      currentPlayerLastAnswers > otherPlayerLastAnswers &&
      otherPlayerHasCorrectAnswers
    ) {
      otherPlayer.addScore();
    }

    if (player.score > otherPlayer.score) {
      player.setGameResult(GameResultEnum.WIN);
      otherPlayer.setGameResult(GameResultEnum.LOSS);
    } else if (player.score < otherPlayer.score) {
      player.setGameResult(GameResultEnum.LOSS);
      otherPlayer.setGameResult(GameResultEnum.WIN);
    } else {
      player.setGameResult(GameResultEnum.DRAW);
      otherPlayer.setGameResult(GameResultEnum.DRAW);
    }

    await this.playerRepository.savePlayer(player);
    await this.playerRepository.savePlayer(otherPlayer);

    game.finishGame();
    await this.gameRepository.saveGame(game);
  }

  private async autoFinishGame(
    gameId: string,
    otherPlayerId: string,
    playerId: string,
  ) {
    const timeoutName = `autoFinishGame: ${gameId}`;

    //проверяю запущен ли таймер
    if (this.schedulerRegistry.doesExist('timeout', timeoutName)) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        await this.fillAnswers(gameId, otherPlayerId);

        const game = await this.gameRepository.findGameById(gameId);
        if (!game) {
          throw DomainExceptionFactory.forbidden();
        }

        const player = game.players.find((p) => p.id === playerId);
        if (!player) {
          throw DomainExceptionFactory.forbidden();
        }

        const otherPlayer = game.players.find((p) => p.id === otherPlayerId);
        if (!otherPlayer) {
          throw DomainExceptionFactory.forbidden();
        }

        await this.countBonusAndFinishGame(game, player, otherPlayer);
      } finally {
        this.schedulerRegistry.deleteTimeout(timeoutName);
      }
    }, this.AUTO_FINISH_DELAY_MS);
    this.schedulerRegistry.addTimeout(timeoutName, timeout);
  }

  private async fillAnswers(gameId: string, playerId: string) {
    const game = await this.gameRepository.findGameById(gameId);
    if (!game) {
      throw DomainExceptionFactory.forbidden();
    }

    const otherPlayer = game.players.find((p) => p.id === playerId);
    if (!otherPlayer) {
      throw DomainExceptionFactory.forbidden();
    }

    const answerCount = otherPlayer.answers.length;
    for (let i = answerCount; i < QUESTION_COUNT; i++) {
      const currentQuestion = game.gameQuestions[i];

      const answer = Answer.createAnswer({
        questionId: currentQuestion.question.id,
        playerAnswer: 'timeout',
        answerStatus: AnswerStatus.Incorrect,
        playerId: otherPlayer.id,
      });

      await this.answerRepository.saveAnswer(answer);
    }
  }
}
