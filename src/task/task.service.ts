import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

export interface TaskListItem {
  taskId: string;
  content: string;
  deadline: string;
  order: number;
  finished: boolean;
  finishedDate?: string;
  description?: string;
  parentTaskId: string;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const defaultTask = this.taskRepository.create({
      taskId: 'default',
      content: '',
      description: '',
    });
    this.taskRepository.save(defaultTask);
  }

  private async checkTask(user: User, taskId: string): Promise<Task> {
    const taskInfo = await this.taskRepository.findOne({ taskId });
    if (!taskInfo) {
      throw new NotFoundException('未找到匹配的任务信息');
    }
    if (taskInfo.creator.email !== user.email) {
      throw new ForbiddenException('没有权限');
    }
    return taskInfo;
  }

  /**
   * get general information for one task
   * @param taskId string
   * @param detail boolean
   */
  async getTaskInfo(creator: User, taskId: string, detail = false) {
    const queryOptions = detail ? { relations: ['creator'] } : {};
    const task = await this.taskRepository.findOne(
      { taskId, creator },
      queryOptions,
    );
    if (!task) {
      throw new NotFoundException('未找到匹配的任务信息');
    }
    return task;
  }

  /**
   * create a task
   * @param user User
   * @param info TaskListItem
   */
  async createTask(user: User, task: TaskListItem) {
    const currentUser = await this.userRepository.findOne({
      email: user.email,
    });
    const taskToBeCreated = Object.keys(task).reduce((result, key) => {
      if (key !== 'parentTaskId') {
        result[key] = task[key];
      }
      return result;
    }, {});
    const parentTaskInfo =
      task.parentTaskId === 'default'
        ? await this.taskRepository.findOne({
            taskId: task.parentTaskId,
          })
        : await this.taskRepository.findOne({ taskId: 'default' });
    const taskInfo = this.taskRepository.create(taskToBeCreated);
    parentTaskInfo.children = (parentTaskInfo.children || []).concat(taskInfo);
    currentUser.tasks = (currentUser.tasks || []).concat(taskInfo);
    const result = await this.taskRepository.insert(taskInfo);
    await this.taskRepository.save(parentTaskInfo);
    await this.userRepository.save(currentUser);
    return result;
  }

  /**
   * update a task
   * @param user User
   * @param task TaskListItem
   */
  async updateTask(user: User, task: TaskListItem) {
    await this.checkTask(user, task.taskId);
    const newTaskInfo = Object.keys(task).reduce((result, currentKey) => {
      if (currentKey !== 'parentTaskId') {
        result[currentKey] = task[currentKey];
      }
      return result;
    }, {});
    return await this.taskRepository.update(
      { taskId: task.taskId },
      newTaskInfo,
    );
  }

  /**
   * soft delete a task
   * @param user User
   * @param task TaskListItem
   */
  async deleteTask(user: User, taskId: string) {
    const taskInfo = await this.checkTask(user, taskId);
    return await this.taskRepository.softDelete(taskInfo);
  }

  /**
   * get first level child tasks
   * @param creator User
   * @param parentTaskId string
   */
  async getFirstLevelChildTasks(creator: User, parentTaskId: string) {
    const parentTask = await this.taskRepository.findOne({
      taskId: parentTaskId,
    });
    if (!parentTask) {
      throw new BadRequestException('任务从属关系错误');
    }
    const items = await this.taskRepository.find({ parentTask, creator });
    return { items };
  }
}
