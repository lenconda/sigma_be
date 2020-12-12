import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { In, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { UserNotification } from './user_notification.entity';
import _ from 'lodash';

export type NotificationType = 'public' | 'private';

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
      sender: user,
      broadcast:
        !notification.receivers ||
        (Array.isArray(notification.receivers) &&
          notification.receivers.length === 0),
    });
    const result = await this.notificationRepository.save(notificationInfo);
    const receivers = await this.userRepository.find({
      where: { email: In((notification.receivers || []) as string[]) },
    });
    const userNotifications: UserNotification[] = receivers.map((receiver) => {
      const userNotification = this.userNotificationRepository.create({
        checked: false,
        notification: result,
        user: receiver,
      });
      return userNotification;
    });
    if (userNotifications.length === 0) {
      userNotifications.push(
        this.userNotificationRepository.create({
          checked: true,
          notification: result,
          user,
        }),
      );
    }
    notificationInfo.userNotifications = userNotifications;
    await this.notificationRepository.save(notificationInfo);
    await this.userNotificationRepository.save(userNotifications);
    return result;
  }

  /**
   * get all notifications
   * @param lastCursor number
   * @param size number
   * @param type NotificationType
   */
  async getNotifications(
    user: User,
    lastCursor: number,
    size: number,
    type: NotificationType,
  ) {
    const lastNotificationId =
      lastCursor || (await this.notificationRepository.count()) + 1;
    const { email } = user;
    switch (type) {
      case 'public': {
        const checkedStatus = [];
        const [rawItems, total] = await this.notificationRepository
          .createQueryBuilder('notifications')
          .where('notifications.broadcast = 1')
          .andWhere('notifications.notificationId < :lastNotificationId', {
            lastNotificationId,
          })
          .take(size)
          .orderBy('notifications.notificationId', 'DESC')
          .getManyAndCount();
        const userNotificationRelations = await this.userNotificationRepository.find(
          {
            relations: ['notification'],
            where: {
              notification: In(rawItems.map((item) => item.notificationId)),
              user,
            },
          },
        );
        userNotificationRelations.forEach((relation) => {
          if (relation.checked) {
            checkedStatus[relation.notification.notificationId] = 1;
          }
        });
        const items = rawItems.map((rawItem) => {
          const itemWithoutUserNotifications = _.omit(
            rawItem,
            'userNotifications',
          );
          return {
            ...itemWithoutUserNotifications,
            checked: checkedStatus[rawItem.notificationId] === 1,
          };
        });
        return { items, total };
      }
      case 'private': {
        const [rawItems, total] = await this.notificationRepository
          .createQueryBuilder('notifications')
          .innerJoinAndSelect(
            'notifications.userNotifications',
            'user_notifications',
            'email = :email',
            { email },
          )
          .where('notifications.broadcast = 0')
          .andWhere('notifications.notificationId < :lastNotificationId', {
            lastNotificationId,
          })
          .take(size)
          .orderBy('notifications.notificationId', 'DESC')
          .getManyAndCount();
        const items = rawItems.map((rawItem) => {
          const itemWithoutUserNotifications = _.omit(
            rawItem,
            'userNotifications',
          );
          return {
            ...itemWithoutUserNotifications,
            checked: rawItem.userNotifications[0].checked,
          };
        });
        return { items, total };
      }
      default:
        throw new BadRequestException('参数错误');
    }
  }

  /**
   * check a notification
   * @param user User
   * @param notificationId number
   */
  async check(user: User, notificationId: number) {
    const notification = await this.notificationRepository.findOne({
      notificationId,
    });
    if (!notification) {
      return {};
    }
    return await this.userNotificationRepository.save({
      checked: true,
      notification,
      user,
    });
  }
}
