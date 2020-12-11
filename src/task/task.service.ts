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
    const taskInfo = await this.taskRepository.findOne(
      { taskId },
      { relations: ['creator'] },
    );
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
  async createTask(user: User, task: TaskListItem, parentTaskId: string) {
    const currentUser = await this.userRepository.findOne(
      {
        email: user.email,
      },
      { relations: ['tasks'] },
    );
    const taskToBeCreated = Object.keys(task).reduce((result, key) => {
      if (key !== 'parentTaskId') {
        result[key] = task[key];
      }
      return result;
    }, {});
    const parentTaskInfo =
      parentTaskId === 'default'
        ? await this.taskRepository.findOne(
            {
              taskId: parentTaskId,
            },
            { relations: ['children'] },
          )
        : await this.taskRepository.findOne(
            { taskId: 'default' },
            { relations: ['children'] },
          );
    const taskInfo = this.taskRepository.create(taskToBeCreated);
    parentTaskInfo.children = (
      (parentTaskInfo.children && Array.from(parentTaskInfo.children)) ||
      []
    ).concat(taskInfo);
    currentUser.tasks = (
      (currentUser.tasks && Array.from(currentUser.tasks)) ||
      []
    ).concat(taskInfo);
    const result = await this.taskRepository.insert(taskInfo);
    await this.taskRepository.save(parentTaskInfo);
    await this.userRepository.save(currentUser);
    return result;
  }

  /**
   * update a task
   * @param user User
   * @param taskId string
   * @param updates TaskListItem
   */
  async updateTask(user: User, taskId: string, updates: Partial<TaskListItem>) {
    await this.checkTask(user, taskId);
    const newTaskInfo = Object.keys(updates).reduce((result, currentKey) => {
      if (currentKey !== 'parentTaskId' && currentKey !== 'taskId') {
        result[currentKey] = updates[currentKey];
      }
      return result;
    }, {});
    return await this.taskRepository.update({ taskId }, newTaskInfo);
  }

  /**
   * soft delete a task
   * @param user User
   * @param task TaskListItem
   */
  async deleteTask(user: User, taskId: string) {
    await this.checkTask(user, taskId);
    return await this.taskRepository.softDelete({ taskId });
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
