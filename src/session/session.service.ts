import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * active a user account
   * @param email email
   * @param code code
   */
  async active(email: string, code: string) {
    const user = await this.userRepository.findOne({ email, code });
    if (!user) {
      throw new NotFoundException('账户无法识别');
    }
    if (user.active) {
      throw new BadRequestException('账户已激活，无需再次激活');
    }
    user.active = true;
    user.code = '';
    return await this.userRepository.save(user);
  }
}
