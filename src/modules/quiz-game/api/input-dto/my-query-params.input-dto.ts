import { IsEnum } from 'class-validator';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
enum MySortBy {
  PAIR_CREATED_DATE = 'pairCreatedDate',
}
export class MyQueryParams extends BaseQueryParams{
  @IsEnum(MySortBy)
  sortBy = MySortBy.PAIR_CREATED_DATE
}