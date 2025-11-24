import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity('GameQuestion')
export class GameQuestion extends BaseEntity {
  @ManyToOne(() => Game, (game) => game.gameQuestions)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Question, (question) => question.gameQuestions)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'uuid' })
  questionId: string;

  static createGameQuestions(
    questions: Question[],
    game: Game,
  ): GameQuestion[] {
    return questions.map((q) => {
      const gameQuestions = new GameQuestion();

      gameQuestions.question = q;
      gameQuestions.questionId = q.id;
      gameQuestions.game = game;
      gameQuestions.gameId = game.id;

      return gameQuestions;
    });
  }
}
