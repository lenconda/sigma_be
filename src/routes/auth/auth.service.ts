import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  /**
   * login
   * @param email email
   * @param password password
   */
  async login(email: string, password: string) {
    const result = await this.userRepository.findOne({ email, password });
    if (!result) {
      throw new ForbiddenException('账户名或密码错误');
    }
    return result;
  }

  /**
   * register
   * @param email email
   * @param password password
   */
  async register(email: string, password: string) {
    if (!email || !password) {
      throw new ForbiddenException('请将个人信息填写完整');
    }
    const user = this.userRepository.create({
      email,
      password,
      avatar: '/assets/images/default_avatar.jpg',
    });
    const result = await this.userRepository.save(user);
    return result;
  }
}
