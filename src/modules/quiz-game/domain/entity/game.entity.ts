import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { GameQuestion } from './game-question.entity';
import { Player } from './player.entity';

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity({ name: 'Game' })
export class Game extends BaseEntity {
  @Column({ type: 'text', default: GameStatus.PendingSecondPlayer })
  status: GameStatus;

  @OneToMany(() => GameQuestion, (gameQuestions) => gameQuestions.game, {
    cascade: true,
  })
  gameQuestions: GameQuestion[];

  @OneToMany(() => Player, (players) => players.game)
  players: Player[];

  @Column({ type: 'timestamptz', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  finishGameDate: Date | null;

  static createGame(player: Player): Game {
    const game = new Game();
    game.gameQuestions = [];
    game.players = [player];

    return game;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  startGame(gameQuestions: GameQuestion[]) {
    this.gameQuestions = gameQuestions;
    this.startGameDate = new Date();
    this.status = GameStatus.Active;
  }

  finishGame() {
    this.finishGameDate = new Date();
    this.status = GameStatus.Finished;
  }
}
