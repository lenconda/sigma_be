import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Template } from 'src/template/template.entity';

@Module({
  providers: [SummaryService],
  controllers: [SummaryController],
  imports: [TypeOrmModule.forFeature([User, Template])],
})
export class SummaryModule {}
