import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'records' })
export class Record {
  @PrimaryGeneratedColumn({ name: 'id' })
  recordId: number;

  @ManyToOne(() => User, (user) => user.records)
  creator: User;

  @Column({ default: '' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
