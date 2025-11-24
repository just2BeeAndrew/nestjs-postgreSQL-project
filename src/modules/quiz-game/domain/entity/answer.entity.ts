import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { Player } from './player.entity';
import { CreateAnswerDomainDto } from '../dto/create-answer.domain.dto';

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

  @Column({ type: 'enum', enum: AnswerStatus })
  answerStatus: AnswerStatus;

  @Column({ type: 'uuid' })
  playerId: string;

  @ManyToOne(() => Player, (player) => player.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player: Player;

  static createAnswer(dto: CreateAnswerDomainDto) {
    const answer = new Answer();

    answer.questionId = dto.questionId;
    answer.answer = dto.playerAnswer;
    answer.answerStatus = dto.answerStatus;
    answer.playerId = dto.playerId;

    return answer;
  }
}
