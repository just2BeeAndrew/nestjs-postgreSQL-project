import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/guards/bearer/jwt-auth.guard';
import { ExtractUserFromAccessToken } from '../../../core/decorators/param/extract-user-from-access-token.decorator';
import { AccessContextDto } from '../../../core/dto/access-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConnectionCommand } from '../application/usecases/connection.usecase';
import { FindGameByIdQuery } from '../application/queries/find-game-by-id.query-handler';
import { AnswerCommand } from '../application/usecases/answer.usecase';
import { AnswerInputDto } from './input-dto/answer.input-dto';
import { MyCurrentQuery } from '../application/queries/my-current.query-handler';
import { FindGameByIdInputDto } from './input-dto/find-game-by-id.input-dto';
import { MyQuery } from '../application/queries/my.query-handler';
import { MyQueryParams } from './input-dto/my-query-params.input-dto';
import { MyStatisticQuery } from '../application/queries/my-statistic.query-handler';

@Controller('pair-game-quiz')
export class PairQuizGameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('pairs/my')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async my(
    @ExtractUserFromAccessToken() user: AccessContextDto,
    @Query() query: MyQueryParams,
  ) {
    return this.queryBus.execute(new MyQuery(user.id, query));
  }

  @Get('users/my-statistic')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async myStatistic(@ExtractUserFromAccessToken() user: AccessContextDto) {
    return this.queryBus.execute(new MyStatisticQuery(user.id))
  }

  @Get('pairs/my-current')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async myCurrent(@ExtractUserFromAccessToken() user: AccessContextDto) {
    return this.queryBus.execute(new MyCurrentQuery(user.id));
  }

  @Get('pairs/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findGameById(
    @ExtractUserFromAccessToken() user: AccessContextDto,
    @Param() id: FindGameByIdInputDto,
  ) {
    return this.queryBus.execute(new FindGameByIdQuery(id.id, user.id));
  }

  @Post('pairs/connection')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async connection(@ExtractUserFromAccessToken() user: AccessContextDto) {
    const gameId = await this.commandBus.execute<ConnectionCommand>(
      new ConnectionCommand(user.id),
    );

    return this.queryBus.execute(new FindGameByIdQuery(gameId, user.id));
  }

  @Post('pairs/my-current/answers')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async answers(
    @ExtractUserFromAccessToken() user: AccessContextDto,
    @Body() body: AnswerInputDto,
  ) {
    return await this.commandBus.execute<AnswerCommand>(
      new AnswerCommand(user.id, body.answer),
    );
  }
}
