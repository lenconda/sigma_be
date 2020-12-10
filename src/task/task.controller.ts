import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/user/user.decorator';
import { User } from 'src/user/user.entity';
import { TaskService } from './task.service';

@Controller('/api/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async createTask(@CurrentUser() user: User, @Body() task: any) {
    return await this.taskService.createTask(user, task);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/children')
  async getFirstLevelChildTasks(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return await this.taskService.getFirstLevelChildTasks(user, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getTaskDetailInfo(@CurrentUser() user: User, @Param('id') id: string) {
    return await this.taskService.getTaskInfo(user, id, true);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateTaskInfo(@CurrentUser() user: User, @Body() updates: any) {
    return await this.taskService.updateTask(user, updates);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteTaskInfo(@CurrentUser() user: User, @Param('id') id: string) {
    return await this.taskService.deleteTask(user, id);
  }
}
