import { InjectRepository } from '@nestjs/typeorm';
import { GameResultEnum, Player } from '../domain/entity/player.entity';
import { Repository } from 'typeorm';
import { GameStatus } from '../domain/entity/game.entity';
import { MyStatisticViewDto } from '../api/view-dto/my-statistic.view-dto';
import {
  SortField,
  TopQueryParams,
} from '../api/input-dto/top-query-params.input-dto';
import { TopViewDto } from '../api/view-dto/top.view-dto';

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
      .addSelect('COALESCE(ROUND(AVG(p.score), 2), 0)', 'avgScores')
      .addSelect('COUNT(p.id)', 'gamesCount')
      .addSelect(
        'COALESCE(SUM(CASE WHEN p.gameResult = :win THEN 1 ELSE 0 END), 0)',
        'winsCount',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN p.gameResult = :loss THEN 1 ELSE 0 END), 0)',
        'lossesCount',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN p.gameResult = :draw THEN 1 ELSE 0 END), 0)',
        'drawsCount',
      )
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

  async top(query: TopQueryParams) {
    const fieldMap: Record<SortField, string> = {
      [SortField.SUM_SCORE]: '"sumScore"',
      [SortField.AVG_SCORES]: '"avgScores"',
      [SortField.GAMES_COUNT]: '"gamesCount"',
      [SortField.WINS_COUNT]: '"winsCount"',
      [SortField.LOSSES_COUNT]: '"lossesCount"',
      [SortField.DRAWS_COUNT]: '"drawsCount"',
      [SortField.ID]: 'u.id',
      [SortField.LOGIN]: 'a.login',
    };

    const qb = this.playerRepository
      .createQueryBuilder('p')
      .leftJoin('p.game', 'g')
      .leftJoin('p.user', 'u')
      .leftJoin('u.accountData', 'a')
      .select('u.id', 'userId')
      .addSelect('a.login', 'login')
      .addSelect('COALESCE(SUM(p.score), 0)', 'sumScore')
      .addSelect('COALESCE(ROUND(AVG(p.score), 2), 0)', 'avgScores')
      .addSelect('COUNT(p.id)', 'gamesCount')
      .addSelect(
        'COALESCE(SUM(CASE WHEN p.gameResult = :win THEN 1 ELSE 0 END), 0)',
        'winsCount',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN p.gameResult = :loss THEN 1 ELSE 0 END), 0)',
        'lossesCount',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN p.gameResult = :draw THEN 1 ELSE 0 END), 0)',
        'drawsCount',
      )
      .where('g.status = :status')
      .groupBy('u.id')
      .addGroupBy('a.login')
      .limit(query.pageSize)
      .offset(query.calculateSkip())
      .setParameters({
        win: GameResultEnum.WIN,
        loss: GameResultEnum.LOSS,
        draw: GameResultEnum.DRAW,
        status: GameStatus.Finished,
      });

    for (const { field, direction } of query.sort) {
      qb.addOrderBy(fieldMap[field], direction.toUpperCase() as 'ASC' | 'DESC');
    }

    const top = await qb.getRawMany();

    const totalCount = await this.playerRepository
      .createQueryBuilder('p')
      .leftJoin('p.game', 'g')
      .leftJoin('p.user', 'u')
      .where('g.status = :status', { status: GameStatus.Finished })
      .select('COUNT(DISTINCT u.id)', 'cnt')
      .getRawOne()
      .then((row) => Number(row.cnt));

    const items = top.map(TopViewDto.mapToView);

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    };
  }
}
