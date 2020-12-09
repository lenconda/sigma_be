import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';
import md5 from 'md5';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // private readonly jwtService: JwtService,
  ) {}

  /**
   * update profile
   * @param user User
   * @param updates Object
   */
  async updateProfile(user: User, updates: Partial<User>) {
    const userInfoUpdates = Object.keys(updates).reduce((result, key) => {
      if (key !== 'password') {
        result[key] = updates[key];
      }
      return result;
    }, {} as Partial<User>);
    const newUserInfo = _.merge(user, userInfoUpdates);
    return await this.userRepository.save(newUserInfo);
  }

  /**
   * update email address
   * @param user User
   * @param email string
   */
  async updateEmailAddress(user: User, email: string) {
    const newUserInfo = _.merge(user, { email });
    await this.userRepository.save(newUserInfo);
    return {
      // token: this.jwtService.sign({ email }),
    };
  }

  /**
   * change password
   * @param user User
   * @param oldPassword string
   * @param newPassword string
   */
  async changePassword(user: User, oldPassword: string, newPassword: string) {
    const userInfo = await this.userRepository.findOne({
      email: user.email,
      password: oldPassword,
    });
    if (!userInfo) {
      throw new ForbiddenException('密码与当前账户不匹配');
    }
    const newUserInfo = _.merge(userInfo, { password: md5(newPassword) });
    await this.userRepository.save(newUserInfo);
  }
}
