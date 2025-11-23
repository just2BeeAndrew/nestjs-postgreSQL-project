import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../core/guards/basic/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { CreateQuestionInputDto } from './input-dto/create-question.input-dto';
import { FindQuestionByIdQuery } from '../application/queries/find-question-by-id.query-handler';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';
import { UpdateQuestionInputDto } from './input-dto/update-question.input-dto';
import { UpdateQuestionCommand } from '../application/usecases/update-question.usecase';
import { PublishQuestionInputDTO } from './input-dto/publish-question.input-dto';
import { PublishQuestionCommand } from '../application/usecases/publish-question.usecase';
import { FindQuestionsQueryParams } from './input-dto/find-questions-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { QuestionViewDto } from './view-dto/question.view-dto';
import { FindAllQuestionsQuery } from '../application/queries/find-all-questions.query-handler';

@Controller('sa/quiz/questions')
export class QuizQuestionsSuperAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAllQuestions(
    @Query() query: FindQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    return this.queryBus.execute(new FindAllQuestionsQuery(query));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(@Body() body: CreateQuestionInputDto) {
    const questionId = await this.commandBus.execute<
      CreateQuestionCommand,
      string
    >(new CreateQuestionCommand(body));

    return this.queryBus.execute(new FindQuestionByIdQuery(questionId));
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: string) {
    return await this.commandBus.execute<DeleteQuestionCommand>(
      new DeleteQuestionCommand(id),
    );
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id') id: string,
    @Body() body: UpdateQuestionInputDto,
  ) {
    return await this.commandBus.execute<UpdateQuestionCommand>(
      new UpdateQuestionCommand(id, body),
    );
  }

  @Put(':id/publish')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param('id') id: string,
    @Body() body: PublishQuestionInputDTO,
  ) {
    return await this.commandBus.execute<PublishQuestionCommand>(
      new PublishQuestionCommand(id, body.published),
    );
  }
}
