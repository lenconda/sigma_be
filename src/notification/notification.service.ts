import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { In, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { UserNotification } from './user_notification.entity';
import uuid from '../utils/uuid';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * publish a notification
   * @param user User
   * @param notification object
   */
  async publish(user: User, notification: Record<string, any>) {
    const NOTIFICATION_OBJECT_KEYS = ['title', 'content', 'subject'];
    const notificationInfo = this.notificationRepository.create({
      ...Object.keys(notification).reduce(
        (result, currentKey) => {
          if (NOTIFICATION_OBJECT_KEYS.indexOf(currentKey) !== -1) {
            result[currentKey] = notification[currentKey];
          }
          return result;
        },
        {} as {
          title: string;
          content: string;
          subject: string;
        },
      ),
      notificationId: uuid(),
      sender: user,
      broadcast: !notification.receivers,
    });
    const receivers = await this.userRepository.find({
      where: { email: In((notification.receivers || []) as string[]) },
    });
    const userNotifications: UserNotification[] = receivers.map(() => {
      const userNotification = this.userNotificationRepository.create({
        checked: false,
        notification: notificationInfo,
        user,
      });
      return userNotification;
    });
    notificationInfo.userNotifications = userNotifications;
    await this.userNotificationRepository.save(userNotifications);
    return await this.notificationRepository.save(notificationInfo);
  }
}
