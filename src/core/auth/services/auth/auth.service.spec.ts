/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredentialsDTO } from '../../dtos/create-user.dto';
import { randomUUID } from 'crypto';
import { User } from '@/core/user/entities/user.entity';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const userRepositoryMock: jest.Mocked<Partial<Repository<User>>> = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        Logger,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    const input: UserCredentialsDTO = {
      email: 'test@example.com',
      password: 'password',
    };

    it('Deve lançar um erro (BadRequestException) caso email já esteja em uso', async () => {
      const user = { id: randomUUID() } as User;
      userRepository.findOne.mockResolvedValue(user);

      await expect(service.register(input)).rejects.toThrow(BadRequestException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: input.email },
      });
    });

    it('Deve cadastrar um novo usuário', async () => {
      const hashedPassword = crypto.createHash('sha256').update(input.password).digest('hex');

      const user = {
        email: input.email,
        password: hashedPassword,
      } as unknown as User;

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(user);
      userRepository.save.mockReturnValue(Promise.resolve(user));

      const result = await service.register(input);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        email: input.email,
        password: hashedPassword,
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        email: input.email,
        password: hashedPassword,
      });
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    const input: UserCredentialsDTO = {
      email: 'test@example.com',
      password: 'password',
    };
    const hashedPassword = crypto.createHash('sha256').update(input.password).digest('hex');
    const user = {
      id: randomUUID(),
      email: input.email,
      password: hashedPassword,
    } as User;

    it('Deve lançar um erro (UnauthorizedException) se o usuário não existir', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(input)).rejects.toThrow(UnauthorizedException);
    });

    it('Deve lançar um erro (UnauthorizedException) se a senha estiver incorreta', async () => {
      const wrongUser = { ...user, password: 'senhaerrada' };
      userRepository.findOne.mockResolvedValue(wrongUser);

      await expect(service.login(input)).rejects.toThrow(UnauthorizedException);
    });

    it('Deve retornar um token se as credenciais estiverem corretas', async () => {
      userRepository.findOne.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('fake-jwt-token');

      const result = await service.login(input);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: input.email },
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          id: user.id,
          email: user.email,
        },
        { secret: 'dev-secret' },
      );

      expect(result).toEqual({ accessToken: 'Bearer fake-jwt-token' });
    });
  });
});
