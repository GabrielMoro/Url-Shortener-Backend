/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from '../../entities/url.entity';
import { User } from '@/core/user/entities/user.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { CreateUrlDto } from '../../dtos/create-url.dto';

jest.mock('@/common/utils/hash.util', () => ({
  generateHash: jest.fn().mockReturnValue('abc123'),
}));

describe('UrlService', () => {
  let service: UrlService;
  let urlRepository: jest.Mocked<Repository<Url>>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    urlRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Url>>;

    userRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getRepositoryToken(Url),
          useValue: urlRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    userRepository = module.get(getRepositoryToken(User));
    urlRepository = module.get(getRepositoryToken(Url));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shorten', () => {
    it('Deve encurtar uma url informada (usuário autenticado)', async () => {
      const dto: CreateUrlDto = { targetUrl: 'https://example.com' };
      const user: User = { id: 'userId' } as User;
      const userEntity = { id: 'userId', email: 'test@example.com' } as User;
      const url = { shortCode: 'abc123', targetUrl: dto.targetUrl };

      userRepository.findOne.mockResolvedValue(userEntity);
      urlRepository.create.mockReturnValue(url as Url);
      urlRepository.save.mockResolvedValue(url as Url);

      const result = await service.shorten(dto, user);

      expect(urlRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          targetUrl: dto.targetUrl,
          user: userEntity,
        }),
      );
      expect(result.shortUrl).toMatch(/http:\/\/localhost:3000\/\w{6}/);
    });

    it('Deve encurtar uma url informada (sem usuário autenticado)', async () => {
      const dto: CreateUrlDto = { targetUrl: 'https://example.com' };
      const url = { shortCode: 'abc123', targetUrl: dto.targetUrl };
      urlRepository.create.mockReturnValue(url as Url);
      urlRepository.save.mockResolvedValue(url as Url);

      const result = await service.shorten(dto);

      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(urlRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          targetUrl: dto.targetUrl,
          user: undefined,
        }),
      );
      expect(result.shortUrl).toMatch(/http:\/\/localhost:3000\/\w{6}/);
    });
  });

  describe('redirect', () => {
    it('Deve retornar targetUrl caso shortCode seja válido', async () => {
      const url = { targetUrl: 'https://example.com', clicks: 0 } as Url;
      urlRepository.findOne.mockResolvedValue(url);
      urlRepository.save.mockResolvedValue({ ...url, clicks: 1 });

      const result = await service.redirect('abc123');

      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: {
          shortCode: 'abc123',
          deletedAt: IsNull(),
        },
      });
      expect(urlRepository.save).toHaveBeenCalled();
      expect(result).toBe('https://example.com');
    });

    it('Deve lançar um erro (NotFoundException) caso shortCode não seja válido', async () => {
      urlRepository.findOne.mockResolvedValue(null);

      await expect(service.redirect('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
