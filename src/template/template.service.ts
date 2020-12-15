import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { In, LessThan, Repository } from 'typeorm';
import { Template } from './template.entity';
import _ from 'lodash';

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
  async createTemplate(user: User, templateInfo: Partial<Template>) {
    const creator = await this.userRepository.findOne(
      { email: user.email },
      { relations: ['templates'] },
    );
    const template: Template = this.templateRepository.create({
      ..._.omit(templateInfo, ['templateId']),
      creator,
    });
    creator.templates = (
      (creator.templates && Array.from(creator.templates)) ||
      []
    ).concat(template);
    await this.templateRepository.insert(template);
    await this.userRepository.save(creator);
    return template;
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
    lastCursor: number,
    size: number,
  ) {
    const lastTemplateId =
      lastCursor ||
      (
        (
          await this.templateRepository.find({
            order: { templateId: 'DESC' },
          })
        )[0] || { templateId: 0 }
      ).templateId + 1;
    let creator = await this.userRepository.findOne({ email });
    if (!creator) {
      creator = user;
    }
    const items = await this.templateRepository.find({
      relations: ['creator'],
      where: {
        creator,
        templateId: LessThan(lastTemplateId),
      },
      order: { templateId: 'DESC' },
      take: size,
    });
    const total = await this.templateRepository.count({ creator });
    return { items, total };
  }

  /**
   * update a template
   * @param user User
   * @param templateId number
   * @param updates Partial<Template>
   */
  async updateTemplate(
    user: User,
    templateId: number,
    updates: Partial<Template>,
  ) {
    const rawTemplateInfo = await this.templateRepository.findOne(
      { templateId },
      { relations: ['creator'] },
    );
    if (rawTemplateInfo.creator.email !== user.email) {
      throw new ForbiddenException('没有权限修改模板');
    }
    const updateTemplateInfo = _.pickBy(
      updates,
      (value, key) => key === 'name' || key === 'content',
    );
    return await this.templateRepository.update(
      { templateId },
      updateTemplateInfo,
    );
  }

  /**
   * delete templates
   * @param creator User
   * @param templateIds number[]
   */
  async deleteTemplates(creator: User, templateIds: number[]) {
    const templates = await this.templateRepository.find({
      relations: ['creator'],
      where: {
        creator,
        templateId: In(templateIds),
      },
    });
    return await this.templateRepository.softDelete(
      templates.map((template) => template.templateId),
    );
  }
}
