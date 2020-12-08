import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Controller('/api/session')
export class SessionController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.authService.login(email, password);
  }
}
