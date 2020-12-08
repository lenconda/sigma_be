import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [SessionController],
  providers: [SessionService],
  imports: [AuthModule],
})
export class SessionModule {}
