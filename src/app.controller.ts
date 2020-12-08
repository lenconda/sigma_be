import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/api')
export class AppController {
  constructor(appService: AppService) {
    this.appService = appService;
  }

  private readonly appService: AppService;
}
