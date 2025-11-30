import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TopQueryParams } from '../../api/input-dto/top-query-params.input-dto';

export class TopQuery {
  constructor(public query: TopQueryParams) {
  }
}

@QueryHandler(TopQuery)
export class TopQueryHandler implements IQueryHandler<TopQuery>{
  constructor() {
  }

  async execute(query: TopQuery) {}
}