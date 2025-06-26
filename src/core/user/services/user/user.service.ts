import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ListUrlDto } from '../../dtos/list-urls.dto';
import { Url } from '@/core/url/entities/url.entity';
import { UpdateUrlDto } from '../../dtos/update-url.dto';
import { DeleteUrlDto } from '../../dtos/delete-url.dto';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly logger: Logger,
  ) {}

  private readonly DEFAULT_BASE_URL = 'http://localhost';

  public async listUrls(userId: string): Promise<ListUrlDto[]> {
    this.logger.log('Iniciando listagem de URLs');

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.urls', 'url', 'url.deletedAt IS NULL')
      .where('user.id = :userId', { userId })
      .getOne()
      .catch((error) => {
        this.logger.error('Erro ao buscar URLs do usuário', error);
        throw new InternalServerErrorException('Erro ao buscar URLs do usuário');
      });

    if (!user) {
      this.logger.warn('Usuário não encontrado', userId);

      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.urls.length) {
      this.logger.log('Usuário não possui URLs');

      return [];
    }

    const baseUrl = process.env.BASE_URL ?? `${this.DEFAULT_BASE_URL}:${process.env.PORT ?? 3000}`;

    return user.urls.map((url) => ({
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      targetUrl: url.targetUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    }));
  }

  public async getUrlByShortCode(userId: string, shortCode: string): Promise<ListUrlDto> {
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

  public async updateOneUrl(userId: string, body: UpdateUrlDto): Promise<ListUrlDto> {
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

  public async deleteOneUrl(userId: string, body: DeleteUrlDto): Promise<ListUrlDto> {
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
