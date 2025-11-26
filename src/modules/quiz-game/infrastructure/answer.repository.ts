import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer, AnswerStatus } from '../domain/entity/answer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnswerRepository {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async saveAnswer(answer: Answer): Promise<Answer> {
    return await this.answerRepository.save(answer);
  }

  async countAnswers(playerId: string, gameId: string): Promise<number> {
    return await this.answerRepository.count({
      where: {
        playerId: playerId,
        player: {
          gameId: gameId,
        },
      },
    });
  }

  async countCorrectAnswers(playerId: string, gameId: string): Promise<Boolean> {
    return await this.answerRepository.exists({
      where: {
        playerId: playerId,
        answerStatus: AnswerStatus.Correct,
        player: {
          gameId: gameId,
        },
      },
    });
  }
}
