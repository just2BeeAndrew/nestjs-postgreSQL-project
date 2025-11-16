import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { IsNotEmpty } from 'class-validator';

export class AnswerInputDto {
  @IsStringWithTrim()
  @IsNotEmpty()
  answer: string;
}