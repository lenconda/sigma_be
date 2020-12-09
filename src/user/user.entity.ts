import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  email: string;

  @Column()
  password: string;

  @Column()
  avatar: string;

  @Column({ default: false })
  active: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  motto: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
