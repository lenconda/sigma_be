import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { RecordController } from './record.controller';
import { Record } from './record.entity';
import { RecordService } from './record.service';
import { RecordType } from './record_type.entity';

@Module({
  controllers: [RecordController],
  providers: [RecordService],
  imports: [TypeOrmModule.forFeature([Record, User, RecordType])],
})
export class RecordModule {}
