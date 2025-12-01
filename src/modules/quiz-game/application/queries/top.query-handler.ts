import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TopQueryParams } from '../../api/input-dto/top-query-params.input-dto';
import { PlayerRepository } from '../../infrastructure/player.repository';

export class TopQuery {
  constructor(public query: TopQueryParams) {
  }
}

@QueryHandler(TopQuery)
export class TopQueryHandler implements IQueryHandler<TopQuery>{
  constructor(private playerRepository: PlayerRepository) {
  }

  async execute(query: TopQuery) {
    return await this.playerRepository.top(query.query);
  }
}