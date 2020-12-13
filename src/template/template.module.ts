import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { TemplateController } from './template.controller';
import { Template } from './template.entity';
import { TemplateService } from './template.service';

@Module({
  imports: [TypeOrmModule.forFeature([Template, User])],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
