import { InjectRepository } from '@nestjs/typeorm';
import { GameResultEnum, Player } from '../domain/entity/player.entity';
import { Repository } from 'typeorm';
import { GameStatus } from '../domain/entity/game.entity';
import { MyStatisticViewDto } from '../api/view-dto/my-statistic.view-dto';

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
        game: true,
      },
    });
  }

  async findEmptyPlayer(userId: string) {
    return await this.playerRepository.findOne({
      where: {
        userId: userId,
        game: {
          status: GameStatus.Active,
        },
      },
      relations: {
        game: true,
      },
    });
  }

  async myStatistic(userId: string) {
    const players = await this.playerRepository
      .createQueryBuilder('p')
      .leftJoin('p.game', 'g')
      .select('COALESCE(SUM(p.score), 0)', 'sumScore')
      .addSelect('COALESCE(ROUND(AVG(p.score), 2), 0)', 'avgScore')
      .addSelect('COUNT(p.id)', 'gamesCount')
      .addSelect('COALESCE(SUM(CASE WHEN p.gameResult = :win THEN 1 ELSE 0 END), 0)', 'winsCount')
      .addSelect('COALESCE(SUM(CASE WHEN p.gameResult = :loss THEN 1 ELSE 0 END), 0)', 'lossesCount')
      .addSelect('COALESCE(SUM(CASE WHEN p.gameResult = :draw THEN 1 ELSE 0 END), 0)', 'drawsCount')
      .where('p.userId = :userId')
      .andWhere('g.status = :status')
      .setParameters({
        win: GameResultEnum.WIN,
        loss: GameResultEnum.LOSS,
        draw: GameResultEnum.DRAW,
        userId: userId,
        status: GameStatus.Finished,
      })
      .getRawOne();

    return MyStatisticViewDto.mapToView(players);
  }
}
