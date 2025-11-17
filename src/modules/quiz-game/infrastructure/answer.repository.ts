import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../domain/entity/answer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnswerRepository {
  constructor(@InjectRepository(Answer) private readonly answerRepository: Repository<Answer>) {
  }

  async countAnswers() {
    return await this.answerRepository.count();
  }
}