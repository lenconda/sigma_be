import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getSummary(@Query('template') templateId: number) {
    return await this.summaryService.getSummary(templateId);
  }
}
