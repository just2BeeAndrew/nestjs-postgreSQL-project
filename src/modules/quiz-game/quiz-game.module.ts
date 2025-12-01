import { Module } from '@nestjs/common';
import { PairQuizGameController } from './api/pair-quiz-game.controller';
import { QuizQuestionsSuperAdminController } from './api/quiz-questions-super-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/entity/question.entity';
import { Answer } from './domain/entity/answer.entity';
import { Game } from './domain/entity/game.entity';
import { GameQuestion } from './domain/entity/game-question.entity';
import { Player } from './domain/entity/player.entity';
import { CreateQuestionUseCase } from './application/usecases/create-question.usecase';
import { QuestionRepository } from './infrastructure/question.repository';
import { FindQuestionByIdQueryHandler } from './application/queries/find-question-by-id.query-handler';
import { QuestionQueryRepository } from './infrastructure/query/question.query-repository';
import { DeleteQuestionUseCase } from './application/usecases/delete-question.usecase';
import { PublishQuestionUseCase } from './application/usecases/publish-question.usecase';
import { UpdateQuestionUseCase } from './application/usecases/update-question.usecase';
import { FindAllQuestionsQueryHandler } from './application/queries/find-all-questions.query-handler';
import { GameRepository } from './infrastructure/game.repository';
import { PlayerRepository } from './infrastructure/player.repository';
import { ConnectionUseCase } from './application/usecases/connection.usecase';
import { FindGameByIdQueryHandler } from './application/queries/find-game-by-id.query-handler';
import { GameQueryRepository } from './infrastructure/query/game.query-repository';
import { AnswerUseCase } from './application/usecases/answer.usecase';
import { AnswerRepository } from './infrastructure/answer.repository';
import { GameQuestionRepository } from './infrastructure/game-question.repository';
import { MyCurrentQueryHandler } from './application/queries/my-current.query-handler';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { MyQueryHandler } from './application/queries/my.query-handler';
import { MyStatisticQueryHandler } from './application/queries/my-statistic.query-handler';
import { TopQueryHandler } from './application/queries/top.query-handler';

const useCases = [
  AnswerUseCase,
  ConnectionUseCase,
  CreateQuestionUseCase,
  DeleteQuestionUseCase,
  PublishQuestionUseCase,
  UpdateQuestionUseCase,
];

const queries = [
  FindAllQuestionsQueryHandler,
  FindGameByIdQueryHandler,
  FindQuestionByIdQueryHandler,
  MyQueryHandler,
  MyCurrentQueryHandler,
  MyStatisticQueryHandler,
  TopQueryHandler,
];

@Module({
  imports: [
    UserAccountsModule,
    CqrsModule,
    TypeOrmModule.forFeature([Answer, Game, GameQuestion, Player, Question]),
  ],
  controllers: [PairQuizGameController, QuizQuestionsSuperAdminController],
  providers: [
    AnswerRepository,
    GameRepository,
    GameQueryRepository,
    GameQuestionRepository,
    PlayerRepository,
    QuestionRepository,
    QuestionQueryRepository,
    ...useCases,
    ...queries,
  ],
  exports: [],
})
export class QuizGameModule {}
