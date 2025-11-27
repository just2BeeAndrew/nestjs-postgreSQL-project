import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../../domain/entity/game.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { Player } from '../../domain/entity/player.entity';

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
      .leftJoinAndSelect('game.players', 'players')
      .leftJoinAndSelect('players.user', 'user')
      .leftJoinAndSelect('user.accountData', 'accountData')
      .leftJoinAndSelect('players.answers', 'answers')
      .leftJoinAndSelect('game.gameQuestions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'question')
      .where('game.status != :status', { status: GameStatus.Finished })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('p.gameId')
          .from('Player', 'p')
          .where('p.userId = :userId', { userId })
          .getQuery();
        return `game.id IN ${subQuery}`;
      })
      .orderBy('players.createdAt', 'ASC')
      .addOrderBy('answers.createdAt', 'ASC')
      .getOne();

    // const game2 = await this.gameRepository.findOne({
    //   where: {
    //     status: Not(GameStatus.Finished),
    //     players: {
    //       userId: userId,
    //     },
    //   },
    //   relations: {
    //     players: {
    //       answers: true,
    //       user: {
    //         accountData: true,
    //       },
    //     },
    //     gameQuestions: {
    //       question: true,
    //     },
    //   },
    // });

    if (!game) {
      return null;
    }

    return GameViewDto.mapToView(game);
  }
}
