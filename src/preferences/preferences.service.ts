import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';
import md5 from 'md5';
import { MailerService } from '@nestjs-modules/mailer';

import appConfig from '../../app.config';
import localConfig from '../../local.config';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly authService: AuthService,
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
    const code = Math.floor(Math.random() * 1000000).toString();
    await this.mailerService.sendMail({
      to: email,
      from: 'no-reply@lenconda.top',
      subject: `【${appConfig.name.toUpperCase()}】验证你的邮箱地址`,
      template: 'mail',
      context: {
        appName: appConfig.name.toUpperCase(),
        mainContent: `在不久前，这个邮箱被用于绑定 ${appConfig.name} 服务。但是，到目前为止，我们仍无法信任这个邮箱。因此，我们需要你点击下面的链接完成邮箱的验证：`,
        linkHref: `${localConfig.SERVICE.HOST}/user/active?m=${Buffer.from(
          email,
        ).toString('base64')}&c=${code}`,
        linkContent: '验证邮箱地址',
        placeholder: '',
      },
    });
    await this.userRepository.update(
      { email: user.email },
      { email, active: false, code },
    );
    return {
      token: this.authService.sign(email),
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
