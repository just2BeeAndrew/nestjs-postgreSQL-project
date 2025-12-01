import { Transform, TransformFnParams } from 'class-transformer';
import { parseSortUtils } from '../../../modules/quiz-game/utils/parse-sort.utils';

export const ParseSort = () =>
  Transform(({ value }: TransformFnParams) => parseSortUtils(value ?? null));