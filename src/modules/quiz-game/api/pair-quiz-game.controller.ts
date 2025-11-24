import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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

@Controller('pair-game-quiz/pairs')
export class PairQuizGameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('my-current')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async myCurrent(@ExtractUserFromAccessToken() user: AccessContextDto) {
    return this.queryBus.execute(new MyCurrentQuery(user.id))
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findGameById(@ExtractUserFromAccessToken() user: AccessContextDto, @Param('id') id: string) {
    return this.queryBus.execute(new FindGameByIdQuery(id, user.id));
  }

  @Post('connection')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async connection(@ExtractUserFromAccessToken() user: AccessContextDto) {
    const gameId = await this.commandBus.execute<ConnectionCommand>(
      new ConnectionCommand(user.id),
    );

    return this.queryBus.execute(new FindGameByIdQuery(gameId, user.id));
  }

  @Post('my-current/answers')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async answers(
    @ExtractUserFromAccessToken() user: AccessContextDto,
    @Body() body: AnswerInputDto,
  ) {
    return await this.commandBus.execute<AnswerCommand>(
      new AnswerCommand(user.id, body.answer),
    );
  }
}
