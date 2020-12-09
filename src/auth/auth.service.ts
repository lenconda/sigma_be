import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import md5 from 'md5';

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
    return await this.userRepository.findOne({
      email,
      password: md5(password),
    });
  }

  /**
   * sign a token
   * @param email email
   */
  sign(email: string) {
    return this.jwtService.sign({ email });
  }

  /**
   * find a user
   * @param email email
   */
  async findUser(email: string) {
    return await this.userRepository.findOne({ email, active: true });
  }
}
