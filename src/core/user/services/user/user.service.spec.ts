/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../entities/user.entity';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateUrlDto } from '../../dtos/update-url.dto';
import { Url } from '@/core/url/entities/url.entity';
import { DeleteUrlDto } from '../../dtos/delete-url.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let urlRepository: jest.Mocked<Repository<Url>>;

  const mockUrl = {
    id: 'url-id',
    shortCode: 'abc123',
    targetUrl: 'https://example.com',
    clicks: 10,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };
  const mockUser = {
    id: 'user-id',
    urls: [mockUrl],
  } as unknown as User;
  const mockUserNoUrl = {
    ...mockUser,
    urls: [],
  };

  beforeEach(async () => {
    userRepository = {
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;
    urlRepository = {
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<Url>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Url),
          useValue: urlRepository,
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

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    urlRepository = module.get(getRepositoryToken(Url));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listUrls', () => {
    it('Deve retornar uma lista de URLs para o usuário', async () => {
      mockQueryBuilder(mockUser);

      const result = await service.listUrls('user-id');

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
      mockQueryBuilder(mockUserNoUrl);

      const result = await service.listUrls('user-id');

      expect(result).toEqual([]);
    });

    it('deve retornar um array vazio se o usuário não for encontrado', async () => {
      mockQueryBuilder(null);

      const result = await service.listUrls('inexistente');

      expect(result).toEqual([]);
    });
  });

  describe('getUrlByShortCode', () => {
    it('Deve retornar a URL correspondente ao shortCode', async () => {
      mockQueryBuilder(mockUser);

      const result = await service.getUrlByShortCode('user-id', 'abc123');

      expect(result).toEqual({
        id: 'url-id',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        targetUrl: 'https://example.com',
        clicks: 10,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
      });
    });

    it('Deve lançar NotFoundException se o usuário não for encontrado', async () => {
      mockQueryBuilder(null);

      await expect(service.getUrlByShortCode('inexistente', 'abc123')).rejects.toThrow(
        new NotFoundException('URL não encontrada'),
      );
    });

    it('Deve lançar NotFoundException se a URL com o shortCode não for encontrada', async () => {
      mockQueryBuilder(mockUserNoUrl);

      await expect(service.getUrlByShortCode('user-id', 'abc123')).rejects.toThrow(
        new NotFoundException('URL não encontrada'),
      );
    });
  });

  describe('updateOneUrl', () => {
    const body: UpdateUrlDto = {
      shortCode: 'abc123',
      newUrl: 'https://new-url.com',
    };

    it('Deve atualizar a URL corretamente', async () => {
      mockQueryBuilder(mockUser);
      urlRepository.save.mockResolvedValue({ ...mockUrl, targetUrl: body.newUrl });

      const result = await service.updateOneUrl('user-id', body);

      expect(urlRepository.save).toHaveBeenCalledWith({
        ...mockUrl,
        targetUrl: body.newUrl,
      });

      expect(result).toEqual({
        id: mockUrl.id,
        shortCode: mockUrl.shortCode,
        shortUrl: `http://localhost:3000/${mockUrl.shortCode}`,
        targetUrl: body.newUrl,
        clicks: mockUrl.clicks,
        createdAt: mockUrl.createdAt,
      });
    });

    it('Deve lançar NotFoundException se o usuário não for encontrado', async () => {
      mockQueryBuilder(null);

      await expect(service.updateOneUrl('inexistente', body)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });

    it('Deve lançar NotFoundException se a URL com o shortCode não for encontrada', async () => {
      mockQueryBuilder(mockUserNoUrl);

      await expect(service.updateOneUrl('user-id', body)).rejects.toThrow(
        new NotFoundException('URL não encontrada'),
      );
    });

    it('Deve lançar BadRequestException se a atualização falhar', async () => {
      mockQueryBuilder(mockUser);
      urlRepository.save.mockRejectedValue(new Error('Erro inesperado'));

      await expect(service.updateOneUrl('user-id', body)).rejects.toThrow(
        new BadRequestException('Erro ao atualizar a URL'),
      );
    });
  });

  describe('deleteOneUrl', () => {
    const deletedAt = new Date('2023-04-22T00:00:00.000Z');

    const body: DeleteUrlDto = {
      shortCode: 'abc123',
    };

    it('Deve deletar logicamente a URL com sucesso', async () => {
      mockQueryBuilder(mockUser);
      urlRepository.save.mockResolvedValue({ ...mockUrl, deletedAt });

      const result = await service.deleteOneUrl('user-id', body);

      expect(urlRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUrl,
        }),
      );

      expect(result).toEqual(
        expect.objectContaining({
          id: mockUrl.id,
          shortCode: mockUrl.shortCode,
          shortUrl: `http://localhost:3000/${mockUrl.shortCode}`,
          targetUrl: mockUrl.targetUrl,
          clicks: mockUrl.clicks,
          createdAt: mockUrl.createdAt,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('Deve lançar BadRequestException se ocorrer erro ao salvar', async () => {
      mockQueryBuilder({
        ...mockUser,
        urls: [
          {
            id: 'url-id',
            shortCode: 'abc123',
            targetUrl: 'https://example.com',
            clicks: 10,
            createdAt: new Date('2023-01-01T00:00:00.000Z'),
            updatedAt: new Date('2023-01-01T00:00:00.000Z'),
          },
        ],
      });
      urlRepository.save.mockRejectedValue(new Error('Erro de DB'));

      await expect(service.deleteOneUrl('user-id', body)).rejects.toThrow(
        new BadRequestException('Erro ao deletar a URL'),
      );
    });

    it('Deve lançar NotFoundException se a URL não for encontrada', async () => {
      mockQueryBuilder(mockUserNoUrl);

      await expect(service.deleteOneUrl('user-id', body)).rejects.toThrow(
        new NotFoundException('URL não encontrada'),
      );
    });

    it('Deve lançar NotFoundException se o usuário não for encontrado', async () => {
      mockQueryBuilder(null);

      await expect(service.deleteOneUrl('inexistente', body)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  function mockQueryBuilder(result: User | null) {
    const qb: Partial<SelectQueryBuilder<User>> = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(result),
    };

    userRepository.createQueryBuilder.mockReturnValue(qb as SelectQueryBuilder<User>);
  }
});
