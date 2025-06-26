/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from '../../entities/url.entity';
import { User } from '@/core/user/entities/user.entity';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
            warn: jest.fn(),
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
      const url = { shortCode: 'abc123', targetUrl: dto.targetUrl } as Url;

      userRepository.findOne.mockResolvedValue(userEntity);
      urlRepository.create.mockReturnValue(url);
      urlRepository.save.mockResolvedValue(url);
      urlRepository.findOne.mockResolvedValue(null);

      const result = await service.shorten(dto, user);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
      expect(urlRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          targetUrl: dto.targetUrl,
          user: userEntity,
        }),
      );
      expect(urlRepository.save).toHaveBeenCalledWith(url);
      expect(result.shortUrl).toMatch(/http:\/\/localhost:3000\/\w{6}/);
    });

    it('Deve encurtar uma url informada (sem usuário autenticado)', async () => {
      const dto: CreateUrlDto = { targetUrl: 'https://example.com' };
      const url = { shortCode: 'abc123', targetUrl: dto.targetUrl } as Url;
      urlRepository.create.mockReturnValue(url);
      urlRepository.save.mockResolvedValue(url);
      urlRepository.findOne.mockResolvedValue(null);

      const result = await service.shorten(dto);

      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(urlRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          targetUrl: dto.targetUrl,
          user: undefined,
        }),
      );
      expect(urlRepository.save).toHaveBeenCalledWith(url);
      expect(result.shortUrl).toMatch(/http:\/\/localhost:3000\/\w{6}/);
    });

    it('Deve lançar BadRequestException se generateUniqueShortCode falhar após MaxAttempts', async () => {
      const dto: CreateUrlDto = { targetUrl: 'https://example.com' };
      urlRepository.findOne
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url)
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url)
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url)
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url)
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url)
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url)
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url)
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url)
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url)
        .mockResolvedValueOnce({ shortCode: 'abc123' } as Url);

      await expect(service.shorten(dto)).rejects.toThrow(BadRequestException);
    });

    it('Deve lançar InternalServerErrorException se urlRepository.save falhar no shorten', async () => {
      const dto: CreateUrlDto = { targetUrl: 'https://example.com' };
      const url = { shortCode: 'abc123', targetUrl: dto.targetUrl } as Url;

      urlRepository.findOne.mockResolvedValue(null);
      urlRepository.create.mockReturnValue(url);
      urlRepository.save.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.shorten(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('redirect', () => {
    it('Deve retornar targetUrl caso shortCode seja válido', async () => {
      const url = { targetUrl: 'https://example.com', clicks: 0 } as Url;
      urlRepository.findOne.mockResolvedValue(url);
      urlRepository.save.mockResolvedValue({ ...url, clicks: 1 } as Url);

      const result = await service.redirect('abc123');

      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: {
          shortCode: 'abc123',
          deletedAt: IsNull(),
        },
      });
      expect(urlRepository.save).toHaveBeenCalledWith(expect.objectContaining({ clicks: 1 }));
      expect(result).toBe('https://example.com');
    });

    it('Deve lançar um erro (NotFoundException) caso shortCode não seja válido', async () => {
      urlRepository.findOne.mockResolvedValue(null);

      await expect(service.redirect('invalid')).rejects.toThrow(NotFoundException);
    });

    it('Deve lançar InternalServerErrorException se urlRepository.save falhar durante o incremento de cliques', async () => {
      const url = { targetUrl: 'https://example.com', clicks: 0 } as Url;
      urlRepository.findOne.mockResolvedValue(url);
      urlRepository.save.mockRejectedValue(new Error('Failed to update clicks'));

      await expect(service.redirect('abc123')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
