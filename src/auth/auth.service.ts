import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * validate user
   * @param email email
   * @param password password
   */
  async validateUser(email: string, password: string) {
    return await this.userRepository.findOne({ email, password });
  }

  /**
   * find a user
   * @param email email
   */
  async findUser(email: string) {
    return await this.userRepository.findOne({ email });
  }

  /**
   * login
   * @param email email
   * @param password password
   */
  async login(email: string, password: string) {
    const result = await this.validateUser(email, password);
    if (!result) {
      throw new ForbiddenException('账户名或密码错误');
    }
    if (!result.active) {
      throw new ForbiddenException('在使用本服务前，请激活该账户');
    }
    return {
      token: this.jwtService.sign({ email }),
    };
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
    await this.userRepository.insert(user);
    return {
      token: this.jwtService.sign({ email }),
    };
  }
}
