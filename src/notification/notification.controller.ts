import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/user/user.decorator';
import { User } from 'src/user/user.entity';
import { NotificationService } from './notification.service';

@Controller('/api/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async publish(@CurrentUser() user: User, @Body() notification: any) {
    return await this.notificationService.publish(user, notification);
  }
}
