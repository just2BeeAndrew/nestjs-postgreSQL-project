import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../domain/entity/game.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
  ) {}
  async saveGame(game: Game): Promise<Game> {
    return this.gameRepository.save(game);
  }

  async findGamePending() {
    return await this.gameRepository.findOne({
      where: { status: GameStatus.PendingSecondPlayer },
      relations: {
        players: true,
      },
    });
  }

  async findGameById(gameId: string): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: {
        id: gameId,
        status: GameStatus.Active,
      },
      relations: {
        players: {
          answers: true,
        },
        gameQuestions: {
          question: true,
        },
      },
    });
  }
}
