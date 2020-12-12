import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/user/user.decorator';
import { User } from 'src/user/user.entity';
import { NotificationService, NotificationType } from './notification.service';

@Controller('/api/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async publish(@CurrentUser() user: User, @Body() notification: any) {
    return await this.notificationService.publish(user, notification);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllPublicNotifications(
    @CurrentUser() user: User,
    @Query('last_cursor') lastCursor: number,
    @Query('size') size = 10,
    @Query('type') type: NotificationType = 'public',
  ) {
    return await this.notificationService.getNotifications(
      user,
      lastCursor,
      size,
      type,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async check(@CurrentUser() user: User, @Param('id') id: number) {
    return await this.notificationService.check(user, id);
  }
}
