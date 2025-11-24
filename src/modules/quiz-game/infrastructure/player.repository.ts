import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../domain/entity/player.entity';
import { Repository } from 'typeorm';
import { GameStatus } from '../domain/entity/game.entity';

export class PlayerRepository {
  constructor(
    @InjectRepository(Player) private playerRepository: Repository<Player>,
  ) {}

  async savePlayer(player: Player): Promise<Player> {
    return await this.playerRepository.save(player);
  }

  async isActivePlayer(userId: string) {
    return await this.playerRepository.findOne({
      where: { userId: userId, game: { status: GameStatus.Active } },
      relations: ['game'],
    });
  }

  async findPlayer(userId: string) {
    return await this.playerRepository.findOne({
      where: {
        userId: userId,
        game: {
          status: GameStatus.Active,
        },
      },
      relations: {
        answers:true,
        game: {
          players: {
            answers: true,
          },
          gameQuestions: {
            question:true
          }
        },
      },
    });
  }
}
