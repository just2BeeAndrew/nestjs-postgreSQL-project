import {
  BaseQueryParams,
  SortDirection,
} from '../../../../core/dto/base.query-params.input-dto';

export enum SortField {
  ID = 'id',
  LOGIN = 'login',
  AVG_SCORES = 'avgScores',
  SUM_SCORE = 'subScore',
  GAMES_COUNT = 'gamesCount',
  WINS_COUNT = 'winsCount',
  LOSSES_COUNT = 'lossesCount',
  DRAWS_COUNT = 'drawsCount',
}

export type SortFieldType = `${SortField}`
export type SortDirectionType = `${SortDirection}`
export type SortItem = `${SortFieldType} ${SortDirectionType}`


export class TopQueryParams extends BaseQueryParams {
  sort: string | string[];
}