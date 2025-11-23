import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum PublishedStatus {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}

enum QuestionSortBy {
  CreatedAt = 'createdAt',
  Body = 'body',
}

export class FindQuestionsQueryParams extends BaseQueryParams {
  @IsString()
  @IsOptional()
  bodySearchTerm: string | null = null;

  @IsEnum(PublishedStatus)
  publishedStatus = PublishedStatus.All;

  @IsEnum(QuestionSortBy)
  sortBy = QuestionSortBy.CreatedAt;
}
