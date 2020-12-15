import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { LessThan, Repository } from 'typeorm';
import { Record } from './record.entity';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * add a record
   * @param user User
   * @param content string
   */
  async addRecord(user: User, content: string) {
    const creator = await this.userRepository.findOne(
      { email: user.email },
      { relations: ['records'] },
    );
    const record = this.recordRepository.create({
      creator,
      content,
    });
    const result = await this.recordRepository.insert(record);
    creator.records = (
      (creator.records && Array.from(creator.records)) ||
      []
    ).concat(record);
    await this.userRepository.save(creator);
    return result;
  }

  /**
   * query records
   * @param user User
   * @param lastCursor number
   * @param size number
   */
  async queryRecords(user: User, lastCursor: number, size: number) {
    const lastRecordId = lastCursor
      ? lastCursor
      : (await this.recordRepository.count({
          withDeleted: true,
        })) + 1;
    const items = await this.recordRepository.find({
      where: {
        creator: user,
        recordId: LessThan(lastRecordId),
      },
      take: size,
      order: { recordId: 'DESC' },
    });
    const total = await this.recordRepository.count({ creator: user });
    return { items, total };
  }
}
