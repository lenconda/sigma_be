import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('/api/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.sessionService.login(email, password);
  }

  @Post('/register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.sessionService.register(email, password);
  }

  @Get('/active')
  async active(@Query('email') email: string, @Query('code') code: string) {
    return await this.sessionService.active(email, code);
  }
}
