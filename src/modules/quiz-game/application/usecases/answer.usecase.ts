import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { DomainExceptionFactory } from '../../../../core/exception/filters/domain-exception-factory';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { Answer, AnswerStatus } from '../../domain/entity/answer.entity';
import { GameQuestionRepository } from '../../infrastructure/game-question.repository';

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
    //TODO: добавить проверку 403
    const player = await this.playerRepository.findPlayer(command.userId);
    if (!player) {
      throw DomainExceptionFactory.notFound();
    }

    const game = await this.gameRepository.findGameById(player.gameId);
    if (!game) {
      throw DomainExceptionFactory.notFound();
    }

    //Получаю общее количество вопросов в игре
    const totalGameQuestions =
      await this.gameQuestionRepository.countGameQuestions(player.gameId);

    let answersCount = player.answers.length;

    const answerStatus = player.game.gameQuestions[
      answersCount
    ].question.correctAnswers.includes(command.answer)
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;

    const answer = Answer.createAnswer({
      questionId: player.game.gameQuestions[answersCount].question.id,
      playerAnswer: command.answer,
      answerStatus: answerStatus,
      playerId: player.id,
    });

    const savedAnswer = await this.answerRepository.saveAnswer(answer);

    if (answerStatus === AnswerStatus.Correct) {
      player.addScore();
      await this.playerRepository.savePlayer(player);
    }

    answersCount += 1;

    if (answersCount === totalGameQuestions) {
      const areOthersCompleted = game.players.some(
        (p) =>
          p.id !== player.id &&
          p.answers.filter((a) => a.player && a.player.gameId === game.id)
            .length === totalGameQuestions,
      );
      if (!areOthersCompleted) {
        const correctAnswerCount = player.answers.filter(
          (a) =>
            a.playerId === player.id &&
            a.player.gameId === player.gameId &&
            a.answerStatus === AnswerStatus.Correct,
        );
        if (correctAnswerCount.length > 0) {
          player.addScore();
          await this.playerRepository.savePlayer(player);
        }
      }
      const allPlayersCompleted = game.players.every(
        (p) => p.answers.length === totalGameQuestions,
      );
      if (allPlayersCompleted) {
        game.finishGame();
      }
    }
    return {
      questionId: savedAnswer.questionId,
      answerStatus: savedAnswer.answerStatus,
      addedAt: savedAnswer.createdAt.toISOString(),
    };
  }
}
