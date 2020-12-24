import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/user/user.decorator';
import { User } from 'src/user/user.entity';
import { RecordService } from './record.service';

@Controller('/api/record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async addRecord(@CurrentUser() user: User, @Body('content') content: string) {
    return await this.recordService.addRecord(user, content);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async queryRecords(
    @CurrentUser() user: User,
    @Query('type') type: string,
    @Query('last_cursor') lastCursor: number,
    @Query('size') size = 10,
  ) {
    return await this.recordService.queryRecords(user, type, lastCursor, size);
  }
}
