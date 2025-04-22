import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { User } from '@/core/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: Logger,
  ) {}

  async register(input: CreateUserDto): Promise<User> {
    this.logger.log('Iniciando cadastro de usuário');

    const emailInUse = await this.userRepository.findOne({ where: { email: input.email } });
    if (emailInUse) {
      this.logger.error('Email já cadastrado', { email: input.email });

      throw new BadRequestException('Email já cadastrado');
    }

    const hashedPassword = crypto.createHash('sha256').update(input.password).digest('hex');
    const user = this.userRepository.create({ email: input.email, password: hashedPassword });

    this.logger.log('Novo usuário cadastrado');

    return this.userRepository.save(user);
  }
}
