import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../../domain/entity/game.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { Player } from '../../domain/entity/player.entity';
import {
  MyQueryParams,
  MySortBy,
} from '../../api/input-dto/my-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

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
    const game = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('g.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('u.accountData', 'ad')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('g.gameQuestions', 'gq')
      .leftJoinAndSelect('gq.question', 'q')
      .where('g.status != :status', { status: GameStatus.Finished })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('p.gameId')
          .from('Player', 'p')
          .where('p.userId = :userId', { userId })
          .getQuery();
        return `game.id IN ${subQuery}`;
      })
      .orderBy('p.createdAt', 'ASC')
      .addOrderBy('a.createdAt', 'ASC')
      .getOne();

    if (!game) {
      return null;
    }

    return GameViewDto.mapToView(game);
  }

  async my(
    query: MyQueryParams,
    userId: string,
  ): Promise<PaginatedViewDto<GameViewDto[]>> {
    const sortDirection = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const sortByMapper: Record<MySortBy, string> = {
      [MySortBy.STATUS]: 'g.status',
      [MySortBy.PAIR_CREATED_DATE]: 'g.createdAt',
    };

    const sortField = sortByMapper[query.sortBy] || `g.${query.sortBy}`;

    const baseQb = this.gameRepository
      .createQueryBuilder('g')
      .innerJoin('g.players', 'me', 'me.userId = :userId', { userId });

    const totalCount = await baseQb.clone().getCount();

    const idsRaw = await baseQb
      .clone()
      .select('g.id', 'id')
      .orderBy(sortField, sortDirection)
      .addOrderBy('g.createdAt', 'DESC')
      .limit(query.pageSize)
      .offset(query.calculateSkip())
      .getRawMany();

    const ids = idsRaw.map((r) => r.id);
    if (!ids.length) {
      return PaginatedViewDto.mapToView({
        items: [],
        totalCount,
        page: query.pageNumber,
        size: query.pageSize,
      });
    }

    const games = await this.gameRepository
      .createQueryBuilder('g')
      .where('g.id IN (:...ids)', { ids })
      .leftJoinAndSelect('g.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('u.accountData', 'ad')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('g.gameQuestions', 'gq')
      .leftJoinAndSelect('gq.question', 'q')
      .orderBy(sortField, sortDirection)
      .addOrderBy('g.createdAt', 'DESC')
      .getMany();

    const items = games.map((game) => GameViewDto.mapToView(game));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
