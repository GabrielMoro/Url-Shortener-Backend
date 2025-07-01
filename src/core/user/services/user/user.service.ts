import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListUrlDto } from '../../dtos/list-urls.dto';
import { Url } from '@/core/url/entities/url.entity';
import { UpdateUrlDto } from '../../dtos/update-url.dto';
import { DeleteUrlDto } from '../../dtos/delete-url.dto';
import { UrlDto } from '../../dtos/url.dto';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly logger: Logger,
  ) {}

  private readonly DEFAULT_BASE_URL = 'http://localhost';

  public async listUrls(userId: string, page: number = 1, limit: number = 10): Promise<ListUrlDto> {
    this.logger.log('Iniciando listagem de URLs', { limit, page });

    const offset = (page - 1) * limit;

    const [urls, totalEntries] = await this.urlRepository
      .createQueryBuilder('url')
      .where('url.userId = :userId', { userId })
      .andWhere('url.deletedAt IS NULL')
      .orderBy('url.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount()
      .catch((error) => {
        this.logger.error('Erro ao buscar URLs do usuário', error);
        throw new InternalServerErrorException('Erro ao buscar URLs do usuário');
      });

    if (!urls.length) {
      this.logger.log('Usuário não possui URLs nesta página');

      return {
        data: [],
      };
    }

    const baseUrl = process.env.BASE_URL ?? `${this.DEFAULT_BASE_URL}:${process.env.PORT ?? 3000}`;
    const data: UrlDto[] = urls.map((url) => ({
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      targetUrl: url.targetUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    }));

    return {
      totalEntries,
      page,
      lastPage: Math.ceil(totalEntries / limit),
      data,
    };
  }

  public async getUrlByShortCode(userId: string, shortCode: string): Promise<UrlDto> {
    this.logger.log('Iniciando busca de URL pelo shortCode');

    const url = await this.urlRepository
      .createQueryBuilder('url')
      .where('url.shortCode = :shortCode', { shortCode })
      .andWhere('url.deletedAt IS NULL')
      .leftJoinAndSelect('url.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .getOne()
      .catch((error) => {
        this.logger.error('Erro ao buscar URLs do usuário', error);
        throw new InternalServerErrorException('Erro ao buscar URLs do usuário');
      });

    if (!url) {
      this.logger.warn('URL não encontrada ou não pertence ao usuário', shortCode);

      throw new NotFoundException('URL não encontrada ou não pertence ao usuário');
    }

    const baseUrl = process.env.BASE_URL ?? `${this.DEFAULT_BASE_URL}:${process.env.PORT ?? 3000}`;

    return {
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      targetUrl: url.targetUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    };
  }

  public async updateOneUrl(userId: string, body: UpdateUrlDto): Promise<UrlDto> {
    this.logger.log('Iniciando atualização de URL');

    const { newUrl, shortCode } = body;

    const url = await this.urlRepository
      .createQueryBuilder('url')
      .where('url.shortCode = :shortCode', { shortCode })
      .andWhere('url.deletedAt IS NULL')
      .leftJoinAndSelect('url.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .getOne()
      .catch((error) => {
        this.logger.error('Erro ao buscar URLs do usuário', error);
        throw new InternalServerErrorException('Erro ao buscar URLs do usuário');
      });

    if (!url) {
      this.logger.warn('URL não encontrada ou não pertence ao usuário', shortCode);

      throw new NotFoundException('URL não encontrada ou não pertence ao usuário');
    }

    url.targetUrl = newUrl;

    try {
      this.logger.log(`Atualizando URL com shortCode: ${shortCode} para: ${newUrl}`);

      const updatedUrl = await this.urlRepository.save(url);

      const baseUrl =
        process.env.BASE_URL ?? `${this.DEFAULT_BASE_URL}:${process.env.PORT ?? 3000}`;

      return {
        id: updatedUrl.id,
        shortCode: updatedUrl.shortCode,
        shortUrl: `${baseUrl}/${updatedUrl.shortCode}`,
        targetUrl: updatedUrl.targetUrl,
        clicks: updatedUrl.clicks,
        createdAt: updatedUrl.createdAt,
        updatedAt: updatedUrl.updatedAt,
      };
    } catch (error) {
      this.logger.error('Erro ao atualizar a URL', error);

      throw new InternalServerErrorException('Erro ao atualizar a URL');
    }
  }

  public async deleteOneUrl(userId: string, body: DeleteUrlDto): Promise<UrlDto> {
    this.logger.log('Iniciando exclusão de URL');

    const { shortCode } = body;

    const url = await this.urlRepository
      .createQueryBuilder('url')
      .where('url.shortCode = :shortCode', { shortCode })
      .andWhere('url.deletedAt IS NULL')
      .leftJoinAndSelect('url.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .getOne()
      .catch((error) => {
        this.logger.error('Erro ao buscar URLs do usuário', error);
        throw new InternalServerErrorException('Erro ao buscar URLs do usuário');
      });

    if (!url) {
      this.logger.warn('URL não encontrada ou não pertence ao usuário', shortCode);

      throw new NotFoundException('URL não encontrada ou não pertence ao usuário');
    }

    url.deletedAt = new Date();

    try {
      this.logger.log(`Marcando URL como deletada: ${shortCode}`);

      const deletedUrl = await this.urlRepository.save(url);

      const baseUrl =
        process.env.BASE_URL ?? `${this.DEFAULT_BASE_URL}:${process.env.PORT ?? 3000}`;

      return {
        id: deletedUrl.id,
        shortCode: deletedUrl.shortCode,
        shortUrl: `${baseUrl}/${deletedUrl.shortCode}`,
        targetUrl: deletedUrl.targetUrl,
        clicks: deletedUrl.clicks,
        createdAt: deletedUrl.createdAt,
        updatedAt: deletedUrl.updatedAt,
        deletedAt: deletedUrl.deletedAt,
      };
    } catch (error) {
      this.logger.error(
        'Erro ao realizar exclusão lógica da URL',
        (error as Error).message,
        (error as Error).stack,
      );

      throw new InternalServerErrorException('Erro ao deletar a URL');
    }
  }
}
