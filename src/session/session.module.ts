import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';

@Module({
  controllers: [SessionController],
  providers: [SessionService],
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
})
export class SessionModule {}
