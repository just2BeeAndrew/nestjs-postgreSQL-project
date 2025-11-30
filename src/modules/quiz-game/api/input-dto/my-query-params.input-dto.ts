import { IsEnum } from 'class-validator';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
export enum MySortBy {
  PAIR_CREATED_DATE = 'pairCreatedDate',
  STATUS = 'status',
}
export class MyQueryParams extends BaseQueryParams{
  @IsEnum(MySortBy)
  sortBy = MySortBy.PAIR_CREATED_DATE
}