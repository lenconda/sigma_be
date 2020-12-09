import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/user.entity';
import { CurrentUser } from '../user/user.decorator';

@Controller('/api/preferences')
export class PreferencesController {
  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  async profile(@CurrentUser() user: User) {
    return user;
  }
}
