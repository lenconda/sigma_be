import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'record_types' })
export class RecordType {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;
}
