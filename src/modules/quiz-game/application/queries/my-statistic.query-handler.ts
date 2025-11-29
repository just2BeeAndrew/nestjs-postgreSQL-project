import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PlayerRepository } from '../../infrastructure/player.repository';

export class MyStatisticQuery {
  constructor(public userId: string) {
  }
}

@QueryHandler(MyStatisticQuery)
export class MyStatisticQueryHandler implements IQueryHandler<MyStatisticQuery> {
  constructor(private playerRepository: PlayerRepository) {
  }

  async execute({userId}: MyStatisticQuery){
    return await this.playerRepository.myStatistic(userId);

  }
}