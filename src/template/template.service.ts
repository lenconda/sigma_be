import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Template } from './template.entity';
import uuid from '../utils/uuid';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * create a template
   * @param creator User
   * @param templateInfo Partial<Template>
   */
  async createTemplate(creator: User, templateInfo: Partial<Template>) {
    const template: Template = this.templateRepository.create({
      ...templateInfo,
      templateId: uuid(),
      creator,
    });
    const user = await this.userRepository.findOne({ email: creator.email });
    user.templates = (user.templates || []).concat(template);
    const result = await this.templateRepository.insert(template);
    await this.userRepository.save(user);
    return result;
  }

  /**
   * query all templates
   * @param user User
   * @param email string
   * @param lastCursor string
   * @param size number
   */
  async queryTemplates(
    user: User,
    email: string,
    lastCursor: string,
    size: number,
  ) {
    let creator = await this.userRepository.findOne({ email });
    if (!creator) {
      creator = user;
    }
  }
}
