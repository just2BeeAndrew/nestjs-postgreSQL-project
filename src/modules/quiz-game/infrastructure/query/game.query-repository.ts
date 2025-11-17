import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../../domain/entity/game.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { DomainExceptionFactory } from '../../../../core/exception/filters/domain-exception-factory';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
  ) {}

  async findGameById(gameId: string): Promise<GameViewDto> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId } ,
      relations:{
        players:{
          answers:true,
          user: {
            accountData: true
          }
        },
        gameQuestions: {
          question: true

        }
      }
    });

    if (!game) {
      throw DomainExceptionFactory.notFound();
    }

    return GameViewDto.mapToView(game);
  }
}
