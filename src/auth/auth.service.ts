import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import md5 from 'md5';
import { MailerService } from '@nestjs-modules/mailer';
import appConfig from '../../app.config';
import localConfig from '../../local.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
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
   * find a user
   * @param email email
   */
  async findUser(email: string) {
    return await this.userRepository.findOne({ email, active: true });
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
      password: md5(password),
      avatar: '/assets/images/default_avatar.jpg',
      code: Math.floor(Math.random() * 1000000).toString(),
    });
    await this.mailerService.sendMail({
      to: email,
      from: 'no-reply@lenconda.top',
      subject: `[${appConfig.name.toUpperCase()}] 验证你的电子邮箱`,
      template: 'mail',
      sender: `${appConfig.name.toUpperCase()}团队`,
      context: {
        appName: appConfig.name.toUpperCase(),
        username: email,
        mainContent: `在不久前，你曾经使用这个电子邮箱地址注册了 [${appConfig.name}] 服务，或者在使用该服务的过程中执行了与账户安全相关的操作，因此我们将你的账户暂时冻结，并向你发送了这封邮件。请点击下面的按钮执行账户激活操作：`,
        linkHref: `${localConfig.SERVICE.HOST}/user/active?email=${user.email}&code=${user.code}`,
        linkContent: '激活账户',
        placeholder: '',
      },
    });
    await this.userRepository.insert(user);
    return {
      token: this.jwtService.sign({ email }),
    };
  }
}
