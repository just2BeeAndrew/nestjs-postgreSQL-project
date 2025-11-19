import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../../domain/entity/game.entity';
import { Not, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GameViewDto } from '../../api/view-dto/game.view-dto';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
  ) {}

  async findGameById(gameId: string): Promise<GameViewDto | null> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: {
        players: {
          answers: true,
          user: {
            accountData: true,
          },
        },
        gameQuestions: {
          question: true,
        },
      },
    });

    if (!game) {
      return null;
    }

    return GameViewDto.mapToView(game);
  }

  async findUnfinishedGame(userId: string): Promise<GameViewDto | null> {
    const game = await this.gameRepository.findOne({
      where: {
        status: Not(GameStatus.Finished),
        players: {
          userId: userId,
        },
      },
      relations: {
        players: {
          answers: true,
          user: {
            accountData: true,
          },
        },
        gameQuestions: {
          question: true,
        },
      },
    });

    if (!game) {
      return null;
    }

    return GameViewDto.mapToView(game);
  }
}
