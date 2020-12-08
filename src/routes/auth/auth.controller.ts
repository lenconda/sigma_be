import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('/api/auth')
export class AuthController {
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  private readonly authService: AuthService;

  @Post('/login')
  async login(@Body() body) {
    return await this.authService.login(body.email, body.password);
  }

  @Post('/register')
  async register(@Body() body) {
    return await this.authService.register(body.email, body.password);
  }
}
