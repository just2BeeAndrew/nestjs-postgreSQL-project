import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { DomainExceptionFactory } from '../../../../core/exception/filters/domain-exception-factory';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { Answer, AnswerStatus } from '../../domain/entity/answer.entity';
import { GameQuestionRepository } from '../../infrastructure/game-question.repository';
import { GameStatus } from '../../domain/entity/game.entity';
import { QUESTION_COUNT } from '../../constants/questions-count';
import { GameResultEnum } from '../../domain/entity/player.entity';

export class AnswerCommand {
  constructor(
    public userId: string,
    public answer: string,
  ) {}
}

@CommandHandler(AnswerCommand)
export class AnswerUseCase implements ICommandHandler<AnswerCommand> {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameQuestionRepository: GameQuestionRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly answerRepository: AnswerRepository,
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
          const currentPlayerLastAnswers = savedAnswer.createdAt;
          const otherPlayerLastAnswers =
            otherPlayer.answers[QUESTION_COUNT - 1].createdAt;
          // Если текущий игрок первый завершил
          if (currentPlayerLastAnswers < otherPlayerLastAnswers) {
            player.setGameResult(GameResultEnum.WIN);
            otherPlayer.setGameResult(GameResultEnum.LOSE);
            const hasCorrectAnswers =
              await this.answerRepository.countCorrectAnswers(
                player.id,
                game.id,
              );

            if (hasCorrectAnswers) {
              player.addScore();
            }
            await this.playerRepository.savePlayer(player);
            await this.playerRepository.savePlayer(otherPlayer)
          } else if (currentPlayerLastAnswers > otherPlayerLastAnswers) {
            player.setGameResult(GameResultEnum.LOSE);
            otherPlayer.setGameResult(GameResultEnum.WIN);
            const hasCorrectAnswers =
              await this.answerRepository.countCorrectAnswers(
                otherPlayer.id,
                game.id,
              );

            if (hasCorrectAnswers) {
              otherPlayer.addScore();
            }
            await this.playerRepository.savePlayer(player);
            await this.playerRepository.savePlayer(otherPlayer)
          } else {
            player.setGameResult(GameResultEnum.DRAW);
            otherPlayer.setGameResult(GameResultEnum.DRAW);
            const playerHasCorrectAnswer =
              await this.answerRepository.countCorrectAnswers(
                player.id,
                game.id,
              );

            const otherHasCorrectAnswer =
              await this.answerRepository.countCorrectAnswers(
                otherPlayer.id,
                game.id,
              );

            if (playerHasCorrectAnswer) {
              player.addScore();
            }

            if (otherHasCorrectAnswer) {
              otherPlayer.addScore();
            }
            await this.playerRepository.savePlayer(player);
            await this.playerRepository.savePlayer(otherPlayer)
          }
          game.finishGame();
          await this.gameRepository.saveGame(game);
        }
      }
    }

    return {
      questionId: savedAnswer.questionId,
      answerStatus: savedAnswer.answerStatus,
      addedAt: savedAnswer.createdAt.toISOString(),
    };
  }
}
