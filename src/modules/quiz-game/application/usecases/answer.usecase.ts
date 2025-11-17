import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { DomainExceptionFactory } from '../../../../core/exception/filters/domain-exception-factory';
import { AnswerRepository } from '../../infrastructure/answer.repository';

export class AnswerCommand {
  constructor(
    public userId: string,
    public answer: string,
  ) {}
}

@CommandHandler(AnswerCommand)
export class AnswerUseCase implements ICommandHandler<AnswerCommand> {
  constructor(private readonly gameRepository: GameRepository,
              private readonly playerRepository: PlayerRepository,
              private readonly answerRepository: AnswerRepository,
              ) {
  }

  async execute(command: AnswerCommand) {
    const game = await this.playerRepository.findPlayer(command.userId)
    if (!game) {
      throw DomainExceptionFactory.notFound()
    }

    const answersCount = await this.answerRepository.countAnswers()


  }
}
