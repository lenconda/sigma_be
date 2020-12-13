import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/user/user.decorator';
import { User } from 'src/user/user.entity';
import { Template } from './template.entity';
import { TemplateService } from './template.service';

@Controller('/api/template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async queryTemplates(
    @CurrentUser() user: User,
    @Query('email') email: string = undefined,
    @Query('last_cursor') lastCursor: number,
    @Query('size') size = 10,
  ) {
    return await this.templateService.queryTemplates(
      user,
      email,
      lastCursor,
      size,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createTemplate(
    @CurrentUser() user: User,
    @Body() template: Partial<Template>,
  ) {
    return await this.templateService.createTemplate(user, template);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateTemplate(
    @CurrentUser() user: User,
    @Param('id') id: number,
    @Body() updates: Partial<Template>,
  ) {
    return await this.updateTemplate(user, id, updates);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async deleteTemplates(@CurrentUser() user: User, @Body('ids') ids: number[]) {
    return await this.templateService.deleteTemplates(user, ids);
  }
}
