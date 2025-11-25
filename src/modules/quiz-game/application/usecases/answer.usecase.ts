import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { DomainExceptionFactory } from '../../../../core/exception/filters/domain-exception-factory';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { Answer, AnswerStatus } from '../../domain/entity/answer.entity';
import { GameQuestionRepository } from '../../infrastructure/game-question.repository';
import { GameStatus } from '../../domain/entity/game.entity';

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

    console.log(player);

    // Находим игру
    const game = player.game;//достать игру через репо

    // Получаем общее количество вопросов в игре
    const totalGameQuestions =
      await this.gameQuestionRepository.countGameQuestions(player.gameId);

    const answersCount = player.answers.length;

    // 403: If current user is not inside active pair
    if (game.status !== GameStatus.Active) {
      throw DomainExceptionFactory.forbidden();
    }

    // 403: or user is in active pair but has already answered to all questions
    if (answersCount >= totalGameQuestions) {
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
    if (newAnswersCount === totalGameQuestions) {
      // Находим другого игрока
      const otherPlayer = game.players.find((p) => p.id !== player.id);

      if (otherPlayer) {
        const otherPlayerAnswersCount = otherPlayer.answers.length;

        // Если текущий игрок первый завершил
        if (otherPlayerAnswersCount < totalGameQuestions) {
          // Проверяем, есть ли у него правильные ответы
          const hasCorrectAnswers = player.answers.some(
            (a) => a.answerStatus === AnswerStatus.Correct,
          );

          // Бонусное очко за скорость
          if (hasCorrectAnswers) {
            player.addScore();
            await this.playerRepository.savePlayer(player);
          }
        }

        // Если оба игрока завершили - завершаем игру
        if (otherPlayerAnswersCount === totalGameQuestions) {
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
