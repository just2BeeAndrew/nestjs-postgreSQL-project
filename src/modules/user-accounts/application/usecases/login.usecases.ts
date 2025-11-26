import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../../core/constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { Session } from '../../domain/entities/session.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { DomainException } from '../../../../core/exception/filters/domain-exception';
import { DomainExceptionCode } from '../../../../core/exception/filters/domain-exception-codes';

export class LoginCommand {
  constructor(
    public dto: { userId: string },
    public title: string,
    public ip: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessTokenJwtService: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenJwtService: JwtService,
    private readonly sessionsRepository: SessionsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const deviceId = uuidv4();

    const accessToken = this.accessTokenJwtService.sign({
      id: command.dto.userId,
    });

    const refreshToken = this.refreshTokenJwtService.sign({
      id: command.dto.userId,
      deviceId: deviceId,
    });

    const { iat, exp } = this.refreshTokenJwtService.decode(refreshToken);

    const user = await this.usersRepository.findById(command.dto.userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extension: [{ message: 'User does not exist', field: 'userId' }],
      });
    }

    const session = Session.create(
      {
        deviceId: deviceId,
        title: command.title,
        ip: command.ip,
        iat: iat,
        exp: exp,
      },
      user,
    );

    await this.sessionsRepository.saveSession(session);

    return { accessToken, refreshToken };
  }
}
