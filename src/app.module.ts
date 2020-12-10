import { Module } from '@nestjs/common';
import path from 'path';
import { getMetadataArgsStorage } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import localConfig from '../local.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { PreferencesModule } from './preferences/preferences.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { TaskModule } from './task/task.module';

const {
  HOST = 'localhost',
  NAME = 'tail',
  PASSWORD = '',
  PORT = 3306,
  USER = 'root',
} = localConfig.DB;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: HOST,
      port: PORT,
      username: USER,
      password: PASSWORD,
      database: NAME,
      entities: getMetadataArgsStorage().tables.map((table) => table.target),
      keepConnectionAlive: true,
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    SessionModule,
    PreferencesModule,
    MailerModule.forRoot({
      transport: localConfig.SMTP,
      template: {
        dir: path.join(process.cwd(), 'src/utils/mail/'),
        adapter: new EjsAdapter(),
      },
    }),
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
