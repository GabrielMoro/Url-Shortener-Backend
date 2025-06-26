/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../entities/user.entity';
import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateUrlDto } from '../../dtos/update-url.dto';
import { Url } from '@/core/url/entities/url.entity';
import { DeleteUrlDto } from '../../dtos/delete-url.dto';

function mockRepositoryQueryBuilder<T extends ObjectLiteral>(result: T | T[] | null) {
  const qb: Partial<SelectQueryBuilder<T>> = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(result),
    getMany: jest.fn().mockResolvedValue(result),
  };
  return qb as SelectQueryBuilder<T>;
}

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
      save: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    urlRepository = {
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
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
            warn: jest.fn(),
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
      userRepository.createQueryBuilder.mockReturnValue(mockRepositoryQueryBuilder(mockUser));

      const result = await service.listUrls('user-id');

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(result).toEqual([
        {
          id: mockUrl.id,
          shortCode: mockUrl.shortCode,
          shortUrl: `http://localhost:3000/${mockUrl.shortCode}`,
          targetUrl: mockUrl.targetUrl,
          clicks: mockUrl.clicks,
          createdAt: mockUrl.createdAt,
          updatedAt: mockUrl.updatedAt,
        },
      ]);
    });

    it('Deve retornar um array vazio se o usuário não tiver URLs', async () => {
      userRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(mockUserNoUrl) as SelectQueryBuilder<User>,
      );

      const result = await service.listUrls('user-id');

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(result).toEqual([]);
    });

    it('Deve lançar NotFoundException se o usuário não for encontrado', async () => {
      userRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(null) as unknown as SelectQueryBuilder<User>,
      );

      await expect(service.listUrls('inexistente')).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });

    it('Deve lançar InternalServerErrorException se a busca de URLs do usuário falhar', async () => {
      userRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockRejectedValue(new Error('DB connection error')),
      } as unknown as SelectQueryBuilder<User>);

      await expect(service.listUrls('user-id')).rejects.toThrow(
        new InternalServerErrorException('Erro ao buscar URLs do usuário'),
      );
    });
  });

  describe('getUrlByShortCode', () => {
    it('Deve retornar a URL correspondente ao shortCode', async () => {
      urlRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(mockUrl) as SelectQueryBuilder<Url>,
      );

      const result = await service.getUrlByShortCode('user-id', 'abc123');

      expect(urlRepository.createQueryBuilder).toHaveBeenCalledWith('url');
      expect(result).toEqual({
        id: mockUrl.id,
        shortCode: mockUrl.shortCode,
        shortUrl: `http://localhost:3000/${mockUrl.shortCode}`,
        targetUrl: mockUrl.targetUrl,
        clicks: mockUrl.clicks,
        createdAt: mockUrl.createdAt,
        updatedAt: mockUrl.updatedAt,
      });
    });

    it('Deve lançar NotFoundException se a URL não for encontrada ou não pertencer ao usuário', async () => {
      urlRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(null) as unknown as SelectQueryBuilder<Url>,
      );

      await expect(service.getUrlByShortCode('user-id', 'invalid')).rejects.toThrow(
        new NotFoundException('URL não encontrada ou não pertence ao usuário'),
      );
    });

    it('Deve lançar InternalServerErrorException se a busca da URL falhar', async () => {
      urlRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockRejectedValue(new Error('DB connection lost during URL search')),
      } as unknown as SelectQueryBuilder<Url>);

      await expect(service.getUrlByShortCode('user-id', 'abc123')).rejects.toThrow(
        new InternalServerErrorException('Erro ao buscar URLs do usuário'),
      );
    });
  });

  describe('deleteOneUrl', () => {
    const deletedAt = new Date();
    const body: DeleteUrlDto = {
      shortCode: 'abc123',
    };
    const deletedUrl = { ...mockUrl, deletedAt } as Url;

    it('Deve deletar logicamente a URL com sucesso', async () => {
      urlRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(mockUrl) as SelectQueryBuilder<Url>,
      );
      urlRepository.save.mockResolvedValue(deletedUrl);

      const result = await service.deleteOneUrl('user-id', body);

      expect(urlRepository.createQueryBuilder).toHaveBeenCalledWith('url');
      expect(urlRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...deletedUrl,
          deletedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: deletedUrl.id,
          shortCode: deletedUrl.shortCode,
          shortUrl: `http://localhost:3000/${deletedUrl.shortCode}`,
          targetUrl: deletedUrl.targetUrl,
          clicks: deletedUrl.clicks,
          createdAt: deletedUrl.createdAt,
          updatedAt: deletedUrl.updatedAt,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('Deve lançar NotFoundException se a URL não for encontrada ou não pertencer ao usuário', async () => {
      urlRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(null) as unknown as SelectQueryBuilder<Url>,
      );

      await expect(service.deleteOneUrl('user-id', body)).rejects.toThrow(
        new NotFoundException('URL não encontrada ou não pertence ao usuário'),
      );
    });

    it('Deve lançar InternalServerErrorException se ocorrer erro ao salvar a exclusão lógica', async () => {
      urlRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(mockUrl) as SelectQueryBuilder<Url>,
      );
      urlRepository.save.mockRejectedValue(new Error('DB delete failed'));

      await expect(service.deleteOneUrl('user-id', body)).rejects.toThrow(
        new InternalServerErrorException('Erro ao deletar a URL'),
      );
    });

    it('Deve lançar InternalServerErrorException se a busca da URL para exclusão falhar', async () => {
      urlRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest
          .fn()
          .mockRejectedValue(new Error('DB connection lost during fetch for delete')),
      } as unknown as SelectQueryBuilder<Url>);

      await expect(service.deleteOneUrl('user-id', body)).rejects.toThrow(
        new InternalServerErrorException('Erro ao buscar URLs do usuário'),
      );
    });
  });

  describe('updateOneUrl', () => {
    it('Deve atualizar a URL corretamente', async () => {
      const body: UpdateUrlDto = {
        shortCode: 'abc123',
        newUrl: 'https://new-url.com',
      };
      const updatedUrl = { ...mockUrl, targetUrl: body.newUrl, updatedAt: new Date() } as Url;

      urlRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(mockUrl) as SelectQueryBuilder<Url>,
      );
      urlRepository.save.mockResolvedValue(updatedUrl);

      const result = await service.updateOneUrl('user-id', body);

      expect(urlRepository.createQueryBuilder).toHaveBeenCalledWith('url');
      expect(urlRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUrl,
          targetUrl: body.newUrl,
        }),
      );
      expect(result).toEqual({
        id: mockUrl.id,
        shortCode: mockUrl.shortCode,
        shortUrl: `http://localhost:3000/${mockUrl.shortCode}`,
        targetUrl: body.newUrl,
        clicks: mockUrl.clicks,
        createdAt: mockUrl.createdAt,
        updatedAt: updatedUrl.updatedAt,
      });
    });

    it('Deve lançar NotFoundException se a URL não for encontrada ou não pertencer ao usuário', async () => {
      const body: UpdateUrlDto = {
        shortCode: 'abc123',
        newUrl: 'https://new-url.com',
      };

      urlRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(null) as unknown as SelectQueryBuilder<Url>,
      );

      await expect(service.updateOneUrl('user-id', body)).rejects.toThrow(
        new NotFoundException('URL não encontrada ou não pertence ao usuário'),
      );
    });

    it('Deve lançar InternalServerErrorException se a atualização falhar', async () => {
      const body: UpdateUrlDto = {
        shortCode: 'abc123',
        newUrl: 'https://new-url.com',
      };

      urlRepository.createQueryBuilder.mockReturnValue(
        mockRepositoryQueryBuilder(mockUrl) as SelectQueryBuilder<Url>,
      );
      urlRepository.save.mockRejectedValue(new Error('DB update failed'));

      await expect(service.updateOneUrl('user-id', body)).rejects.toThrow(
        new InternalServerErrorException('Erro ao atualizar a URL'),
      );
    });

    it('Deve lançar InternalServerErrorException se a busca da URL para atualização falhar', async () => {
      const body: UpdateUrlDto = {
        shortCode: 'abc123',
        newUrl: 'https://new-url.com',
      };

      urlRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockRejectedValue(new Error('Network error during fetch')),
      } as unknown as SelectQueryBuilder<Url>);

      await expect(service.updateOneUrl('user-id', body)).rejects.toThrow(
        new InternalServerErrorException('Erro ao buscar URLs do usuário'),
      );
    });
  });
});
