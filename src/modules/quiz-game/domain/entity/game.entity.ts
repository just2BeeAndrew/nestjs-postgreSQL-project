import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { GameQuestion } from './game-question.entity';
import { Player } from './player.entity';
import { Question } from './question.entity';

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity({ name: 'Game' })
export class Game extends BaseEntity {
  @Column({ type: 'text', default: GameStatus.PendingSecondPlayer })
  status: GameStatus;

  @OneToMany(() => GameQuestion, (gameQuestions) => gameQuestions.game)
  gameQuestions: GameQuestion[];

  @OneToMany(() => Player, (players) => players.game)
  players: Player[];

  @Column()
  startGameDate: Date;

  @Column()
  finishGameDate: Date;

  static createGame(player: Player) {
    const game = new Game();
    game.gameQuestions = [];
    game.players = [player];

    return game;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  startGame(gameQuestion: GameQuestion[]) {
    this.gameQuestions = gameQuestion;
    this.startGameDate = new Date();
    this.status = GameStatus.Active;
  }
}
