import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { GameQueryRepository } from '../../infrastructure/query/game.query-repository';
import { DomainExceptionFactory } from '../../../../core/exception/filters/domain-exception-factory';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class MyCurrentQuery {
  constructor(public userId: string) {}
}

@QueryHandler(MyCurrentQuery)
export class MyCurrentQueryHandler
  implements IQueryHandler<MyCurrentQuery, GameViewDto>
{
  constructor(private readonly gameQueryRepository: GameQueryRepository) {}

  async execute(query: MyCurrentQuery): Promise<GameViewDto> {
    const game = await this.gameQueryRepository.findUnfinishedGame(
      query.userId,
    );
    if (!game) {
      throw DomainExceptionFactory.notFound(
        'userId',
        'active pairs are not found',
      );
    }

    return game;
  }
}
