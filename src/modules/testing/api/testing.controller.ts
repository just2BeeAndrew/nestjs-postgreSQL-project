import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllCommand } from '../application/usecases/delete-all.usecase';

@Controller('testing')
export class TestingController {
  constructor(private commandBus: CommandBus) {}

  @Get('sandbox')
  @HttpCode(HttpStatus.OK)
  async getSandbox() {}

  @Post('sandbox')
  @HttpCode(HttpStatus.OK)
  async postSandbox(){}

  @Put('sandbox')
  @HttpCode(HttpStatus.OK)
  async putSandbox() {}


  @Delete('all-data')
  @HttpCode(HttpStatus.OK)
  async deleteAll() {
    return this.commandBus.execute<DeleteAllCommand>(new DeleteAllCommand());
  }
}
