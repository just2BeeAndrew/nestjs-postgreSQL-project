import { SortField } from '../api/input-dto/top-query-params.input-dto';
import { SortDirection } from '../../../core/dto/base.query-params.input-dto';

export type SortType = {
  field: SortField
  direction: SortDirection
}