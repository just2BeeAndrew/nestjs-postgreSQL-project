import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MyQueryParams } from '../../api/input-dto/my-query-params.input-dto';
import { GameQueryRepository } from '../../infrastructure/query/game.query-repository';

export class MyQuery {
  constructor(
    public userId: string,
    public query: MyQueryParams,
  ) {}
}

@QueryHandler(MyQuery)
export class MyQueryHandler implements IQueryHandler<MyQuery> {
  constructor(private gameQueryRepository: GameQueryRepository) {}

  async execute(query: MyQuery) {
    return await this.gameQueryRepository.my(query.query,query.userId);

  }
}
