import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../domain/entity/question.entity';
import { CreateQuestionInputDto } from '../../api/input-dto/create-question.input-dto';
import { QuestionRepository } from '../../infrastructure/question.repository';

export class CreateQuestionCommand {
  constructor(public readonly dto: CreateQuestionInputDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand, string>
{
  constructor(
    private readonly questionRepository: QuestionRepository,
  ) {}

  async execute({ dto }: CreateQuestionCommand): Promise<string> {
    const question = Question.create(dto)

    await this.questionRepository.saveQuestion(question);

    return question.id
  }
}
