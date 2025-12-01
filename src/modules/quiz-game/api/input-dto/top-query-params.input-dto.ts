import {
  BaseQueryParams,
  SortDirection,
} from '../../../../core/dto/base.query-params.input-dto';
import { SortType } from '../../types/sort.types';
import { ParseSort } from '../../../../core/decorators/transform/parse-sort';

export enum SortField {
  ID = 'id',
  LOGIN = 'login',
  AVG_SCORES = 'avgScores',
  SUM_SCORE = 'sumScore',
  GAMES_COUNT = 'gamesCount',
  WINS_COUNT = 'winsCount',
  LOSSES_COUNT = 'lossesCount',
  DRAWS_COUNT = 'drawsCount',
}

export type SortFieldType = `${SortField}`;
export type SortDirectionType = `${SortDirection}`;

export class TopQueryParams extends BaseQueryParams {
  @ParseSort()
  sort: SortType[];
}