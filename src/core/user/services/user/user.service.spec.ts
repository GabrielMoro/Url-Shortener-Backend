/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Logger } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listUrls', () => {
    it('Deve retornar uma lista de URLs para o usuário', async () => {
      const mockUser = {
        id: 'user-id',
        urls: [
          {
            id: 'url-id',
            shortCode: 'abc123',
            targetUrl: 'https://example.com',
            clicks: 10,
            createdAt: new Date('2023-01-01T00:00:00.000Z'),
          },
        ],
      } as unknown as User;

      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.listUrls('user-id');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        relations: ['urls'],
      });

      expect(result).toEqual([
        {
          id: 'url-id',
          shortCode: 'abc123',
          shortUrl: 'http://localhost:3000/abc123',
          targetUrl: 'https://example.com',
          clicks: 10,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
        },
      ]);
    });

    it('Deve retornar um array vazio se o usuário não tiver URLs', async () => {
      const mockUser = { id: 'user-id', urls: [] } as unknown as User;

      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.listUrls('user-id');

      expect(result).toEqual([]);
    });

    it('deve retornar um array vazio se o usuário não for encontrado', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.listUrls('inexistente');

      expect(result).toEqual([]);
    });
  });
});
