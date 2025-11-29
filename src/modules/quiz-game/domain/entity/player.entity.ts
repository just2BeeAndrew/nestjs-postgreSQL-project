import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../../user-accounts/domain/entities/user.entity';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { Answer } from './answer.entity';
import { Game } from './game.entity';

export enum GameResultEnum {
  PENDING = 'pending',
  WIN = 'win',
  LOSE = 'lose',
  DRAW = 'draw',
}

@Entity({ name: 'Player' })
export class Player extends BaseEntity {
  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'text', default: GameResultEnum.PENDING })
  gameResult: GameResultEnum;

  @OneToMany(() => Answer, (answers) => answers.player)
  answers: Answer[];

  @ManyToOne(() => User, (user) => user.players)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Game, (game) => game.players)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column({ type: 'uuid', nullable: true, default: null })
  gameId: string;

  static createPlayer(user: User) {
    const player = new Player();

    player.userId = user.id;
    player.score = 0;
    player.answers = [];

    return player;
  }

  addScore() {
    this.score += 1;
  }

  setGameResult(gameResult: GameResultEnum) {
    this.gameResult = gameResult;
  }
}
