import { AnswerStatus } from '../../domain/entity/answer.entity';
import { Game, GameStatus } from '../../domain/entity/game.entity';

export class AnswerViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}

export class PlayerViewDto {
  id: string;
  login: string;
}

export class PlayerProgressViewDto {
  answers: AnswerViewDto[];
  player: PlayerViewDto;
  score: number;
}

export class QuestionsViewDto {
  id: string;
  body: string;
}

export class GameViewDto {
  id: string;
  firstPlayerProgress: PlayerProgressViewDto;
  secondPlayerProgress: PlayerProgressViewDto | null;
  questions: QuestionsViewDto[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;

  static mapToView(game: Game): GameViewDto {
    const sortedPlayers = [...game.players].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    const [firstPlayer, secondPlayer] = sortedPlayers;



    return {
      id: game.id,
      firstPlayerProgress: {
        answers: (firstPlayer.answers ?? []).map((a) => ({
          questionId: a.questionId,
          answerStatus: a.answerStatus,
          addedAt: a.createdAt.toISOString(),
        })),
        player: {
          id: firstPlayer.user.id,
          login: firstPlayer.user.accountData.login,
        },
        score: firstPlayer.score,
      },
      secondPlayerProgress: secondPlayer
        ? {
            answers: (secondPlayer.answers ?? []).map((a) => ({
              questionId: a.questionId,
              answerStatus: a.answerStatus,
              addedAt: a.createdAt.toISOString(),
            })),
            player: {
              id: secondPlayer.user.id,
              login: secondPlayer.user.accountData.login,
            },
            score: secondPlayer.score,
          }
        : null,
      questions:
        game.gameQuestions && game.gameQuestions.length > 0
          ? [...game.gameQuestions]
              .sort((a, b) => a.order - b.order) // Сортируем по order
              .map((gq) => ({
                id: gq.question.id,
                body: gq.question.body,
              }))
          : null,
      status: game.status,
      pairCreatedDate: game.createdAt.toISOString(),
      startGameDate: (game.startGameDate as Date)?.toISOString() ?? null,
      finishGameDate: (game.finishGameDate as Date)?.toISOString() ?? null,
    };
  }
}
