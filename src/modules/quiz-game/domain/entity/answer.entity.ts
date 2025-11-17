import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { Player } from './player.entity';

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

@Entity({ name: 'Answer' })
export class Answer extends BaseEntity {
  @Column({type: "uuid"})
  questionId: string;

  @Column({type: "text"})
  answer: string;

  @Column({ type: 'text' })
  answerStatus: AnswerStatus;

  @ManyToOne(() => Player, (player) => player.answers)
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @Column({ type: 'uuid' })
  playerId: string;
}
