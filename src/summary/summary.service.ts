import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Template } from 'src/template/template.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async getSummary(templateId: number) {
    return { content: templateId };
  }
}
