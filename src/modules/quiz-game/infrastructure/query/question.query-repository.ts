import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/entity/question.entity';
import { Repository } from 'typeorm';
import {
  QuestionRaw,
  QuestionViewDto,
} from '../../api/view-dto/question.view-dto';
import { FindQuestionsQueryParams } from '../../api/input-dto/find-questions-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class QuestionQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async findAllQuestions(
    query: FindQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const sortDirection = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const publishedMap = new Map<string, boolean | null>([
      ['all', null],
      ['published', true],
      ['notPublished', false],
    ]);
    const publishedFilter = publishedMap.get(query.publishedStatus) ?? null;

    const bodyTerm = query.bodySearchTerm ? `%${query.bodySearchTerm}%` : null;

    let questionsQb = this.questionRepository
      .createQueryBuilder('q')
      .select([
        'q.id AS id',
        'q.body AS body',
        'q.correctAnswers AS "correctAnswers"',
        'q.published AS published',
        'q.createdAt AS "createdAt"',
        'q.updatedAt AS "updatedAt"',
      ])

    if (publishedFilter !== null) {
      questionsQb = questionsQb.where('q.published = :published', {
        published: publishedFilter,
      });
    }

    if (bodyTerm) {
      questionsQb = questionsQb.andWhere('q.body ILIKE :bodyTerm', {
        bodyTerm,
      });
    }

    questionsQb = questionsQb
      .orderBy(`q.${query.sortBy}`, sortDirection)
      .limit(query.pageSize)
      .offset(query.calculateSkip());

    const questions = await questionsQb.getRawMany<QuestionRaw>();

    let questionsCount = this.questionRepository
      .createQueryBuilder('q')

    if (publishedFilter !== null) {
      questionsCount = questionsQb.where('q.published = :published', {
        published: publishedFilter,
      });
    }

    if (bodyTerm) {
      questionsCount = questionsCount.andWhere('q.body ILIKE :bodyTerm', {
        bodyTerm,
      });
    }

    const totalCount = await questionsCount.getCount();

    const items = questions.map(QuestionViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async findQuestionById(id: string): Promise<QuestionViewDto | null> {
    const question = await this.questionRepository
      .createQueryBuilder('q')
      .select([
        'q.id AS id',
        'q.body AS body',
        'q.correctAnswers AS "correctAnswers"',
        'q.published AS published',
        'q.createdAt AS "createdAt"',
        'q.updatedAt AS "updatedAt"',
      ])
      .where('q.id = :id', { id })
      .getRawOne<QuestionRaw>();

    if (!question) return null;

    return QuestionViewDto.mapToView(question);
  }
}
