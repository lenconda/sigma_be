import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { UserNotification } from './user_notification.entity';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryColumn({ name: 'id' })
  notificationId: string;

  @Column()
  title: string;

  @Column({ default: '' })
  content: string;

  @CreateDateColumn({ name: 'time' })
  time: Date;

  @Column({ default: '' })
  subject: string;

  @Column({ default: true })
  broadcast: boolean;

  @ManyToOne(() => User, (user) => user.sendedNotifications)
  sender: User;

  @OneToMany(
    () => UserNotification,
    (userNotifications) => userNotifications.notification,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  userNotifications: UserNotification[];
}
