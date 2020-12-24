import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RecordType {
  OPERATION = 'operation',
  EXCEPTION = 'exception',
}

@Entity({ name: 'records' })
export class Record {
  @PrimaryGeneratedColumn({ name: 'id' })
  recordId: number;

  @Column({ default: '' })
  content: string;

  @Column({ type: 'enum', enum: RecordType, nullable: true })
  type: RecordType;

  @ManyToOne(() => User, (user) => user.records)
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
