import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserCredentialsDTO } from '../../dtos/create-user.dto';
import { User } from '@/core/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { LoginReturnDto } from '../../dtos/login-return.dto';

@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  public async register(input: UserCredentialsDTO): Promise<User> {
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

  public async login(input: UserCredentialsDTO): Promise<LoginReturnDto> {
    this.logger.log('Iniciando login');
    const hashedPassword = crypto.createHash('sha256').update(input.password).digest('hex');

    const user = await this.userRepository.findOne({ where: { email: input.email } });
    if (!user || user.password != hashedPassword) {
      this.logger.error('Credenciais inválidas');

      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      expiresIn: process.env.TOKEN_TIMEOUT ?? '1h',
    });

    this.logger.log(`Usuário autenticado: ${user.email}`);

    return {
      accessToken: `Bearer ${accessToken}`,
    };
  }
}
