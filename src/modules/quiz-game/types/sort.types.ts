import { SortField } from '../api/input-dto/top-query-params.input-dto';
import { SortDirection } from 'typeorm';

export type SortType = {
  field: SortField
  direction: SortDirection
}