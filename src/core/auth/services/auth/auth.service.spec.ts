/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException, Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { randomUUID } from 'crypto';
import { User } from '@/core/user/entities/user.entity';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;

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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('register', () => {
    const input: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should throw if email is already in use', async () => {
      const user = { id: randomUUID() } as User;
      userRepository.findOne.mockResolvedValue(user);

      await expect(service.register(input)).rejects.toThrow(BadRequestException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: input.email },
      });
    });

    it('should hash password, create and save user', async () => {
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
});
