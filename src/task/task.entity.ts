import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryColumn({ name: 'id' })
  taskId: string;

  @Column({ default: '' })
  content: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: false })
  finished: boolean;

  @ManyToOne(() => Task, (task) => task.children)
  parentTask: Task;

  @OneToMany(() => Task, (task) => task.parentTask, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  children: Task[];

  @Column({ type: 'datetime', nullable: true })
  deadline: Date;

  @Column({ type: 'datetime', name: 'finished_date', nullable: true })
  finishedDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ default: -1 })
  priority: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: string;

  @ManyToOne(() => User, (user) => user.email)
  creator: User;
}
