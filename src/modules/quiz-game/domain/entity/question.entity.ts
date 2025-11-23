import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { CreateQuestionDomainDto } from '../dto/create-question.domain.dto';
import { GameQuestion } from './game-question.entity';

@Entity({ name: 'Question' })
export class Question extends BaseEntity {
  @Column({ type: 'text', collation: 'C.utf8' })
  body: string;

  @Column({ type: 'jsonb' })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @OneToMany(() => GameQuestion, (gameQuestions) => gameQuestions.question)
  gameQuestions: GameQuestion[];

  static create(dto: CreateQuestionDomainDto) {
    const question = new Question();

    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;

    return question;
  }

  updateQuestion(body: string, correctAnswers: string[]) {
    this.body = body;
    this.correctAnswers = correctAnswers;
  }

  updatePublish(published: boolean) {
    this.published = published;
  }
}
