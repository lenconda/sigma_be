import { Task } from 'src/task/task.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  avatar: string;

  @Column({ select: false })
  code: string;

  @Column({ default: false })
  active: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, type: 'datetime' })
  birthday: Date;

  @Column({ nullable: true })
  motto: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => Task, (task) => task.creator, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  tasks: Task[];
}
