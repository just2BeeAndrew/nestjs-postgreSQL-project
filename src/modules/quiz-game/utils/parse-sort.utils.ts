import {
  SortDirectionType,
  SortField,
  SortFieldType,
} from '../api/input-dto/top-query-params.input-dto';
import { SortDirection } from '../../../core/dto/base.query-params.input-dto';
import { SortType } from '../types/sort.types';

export const parseSortUtils = (sort: string | string[] | null): SortType[] => {
  const rawItems: string[] =
    sort === null
      ? ['avgScores desc', 'sumScore desc', 'winsCount desc', 'lossesCount asc']
      : Array.isArray(sort)
        ? sort
        : [sort];

  return rawItems.map((item) => {
    const [field, direction] = item.split(' ') as [
      SortFieldType,
      SortDirectionType,
    ];

    return {
      field: field as SortField,
      direction: direction as SortDirection
    };
  });
};
