import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getMetadataArgsStorage } from 'typeorm';
import DBConfig from '../db.config';

import { AuthModule } from './routes/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const {
  DB_HOST = 'localhost',
  DB_NAME = 'tail',
  DB_PASSWORD = '',
  DB_PORT = 3306,
  DB_USER = 'root',
} = DBConfig;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: getMetadataArgsStorage().tables.map((table) => table.target),
      keepConnectionAlive: true,
      synchronize: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
