import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RecordType } from './record_type.entity';

@Entity({ name: 'records' })
export class Record {
  @PrimaryGeneratedColumn({ name: 'id' })
  recordId: number;

  @Column({ default: '' })
  content: string;

  @ManyToOne(() => RecordType, (recordType) => recordType.id)
  type: RecordType;

  @ManyToOne(() => User, (user) => user.records)
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
