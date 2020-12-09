import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/user.entity';
import { CurrentUser } from '../user/user.decorator';
import { PreferencesService } from './preferences.service';

@Controller('/api/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updates: Partial<User>,
  ) {
    return await this.preferencesService.updateProfile(user, updates);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/profile/email')
  async changeEmail(@CurrentUser() user: User, @Body('email') email: string) {
    return await this.preferencesService.updateEmailAddress(user, email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/profile/password')
  async changePassword(
    @CurrentUser() user: User,
    @Body('old') oldPassword: string,
    @Body('new') newPassword: string,
  ) {
    return await this.preferencesService.changePassword(
      user,
      oldPassword,
      newPassword,
    );
  }
}
