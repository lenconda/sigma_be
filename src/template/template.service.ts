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
  async createTemplate(creator: User, templateInfo: Partial<Template>) {
    const template: Template = this.templateRepository.create({
      ..._.omit(templateInfo, ['templateId']),
      creator,
    });
    const result = await this.templateRepository.insert(template);
    const user = await this.userRepository.findOne({ email: creator.email });
    user.templates = (user.templates || []).concat(template);
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
    lastCursor: number,
    size: number,
  ) {
    const lastTemplateId =
      lastCursor || (await this.templateRepository.count()) + 1;
    let creator = await this.userRepository.findOne({ email });
    if (!creator) {
      creator = user;
    }
    const [rawItems, count] = await this.templateRepository.findAndCount({
      relations: ['creator'],
      where: { templateId: LessThan(lastTemplateId) },
      order: { templateId: 'DESC' },
      take: size,
    });

    return { items: rawItems, count };
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
    const updateTemplateInfo = _.pick(updates, ['name, content']);
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
    return await this.templateRepository.delete(
      templates.map((template) => template.templateId),
    );
  }
}
