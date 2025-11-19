import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/query/game.query-repository';
import { DomainExceptionFactory } from '../../../../core/exception/filters/domain-exception-factory';

export class FindGameByIdQuery {
  constructor(
    public gameId: string,
    public userId: string,
  ) {}
}

@QueryHandler(FindGameByIdQuery)
export class FindGameByIdQueryHandler
  implements IQueryHandler<FindGameByIdQuery>
{
  constructor(private readonly gameQueryRepository: GameQueryRepository) {}

  async execute(query: FindGameByIdQuery) {
    const game = await this.gameQueryRepository.findGameById(query.gameId);
    if (!game) {
      throw DomainExceptionFactory.notFound('gameId', 'Game not found');
    }

    if (
      query.userId !== game.firstPlayerProgress.player.id &&
      query.userId !== game.secondPlayerProgress?.player.id
    ) {
      throw DomainExceptionFactory.forbidden();
    }
    return game;
  }
}
