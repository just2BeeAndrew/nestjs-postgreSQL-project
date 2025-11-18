import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameQuestion } from '../domain/entity/game-question.entity';

@Injectable()
export class GameQuestionRepository {
  constructor(
    @InjectRepository(GameQuestion)
    private gameQuestionRepository: Repository<GameQuestion>,
  ) {}

  async countGameQuestions(gameId: string) {
    return await this.gameQuestionRepository.count({
      where: {
        gameId: gameId,
      },
    });
  }
}
