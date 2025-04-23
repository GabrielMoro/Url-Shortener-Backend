import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

  private readonly DEFAULT_BASE_URL = 'http://localhost:3000';

  async listUrls(userId: string): Promise<ListUrlDto[]> {
    this.logger.log('Iniciando listagem de URLs');

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['urls'],
    });

    if (!user?.urls) {
      this.logger.log('Usuário não possui URLs');

      return [];
    }

    const baseUrl = process.env.BASE_URL || this.DEFAULT_BASE_URL;

    return user.urls.map((url) => ({
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      targetUrl: url.targetUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    }));
  }

  async getUrlByShortCode(userId: string, shortCode: string): Promise<ListUrlDto> {
    this.logger.log('Iniciando busca de URL pelo shortCode');

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['urls'],
    });

    if (!user) {
      this.logger.error('Usuário não encontrado');

      throw new NotFoundException('URL não encontrada');
    }

    const url = user.urls.find((url) => url.shortCode === shortCode && !url.deletedAt);

    if (!url) {
      this.logger.error('URL não encontrada');

      throw new NotFoundException('URL não encontrada');
    }

    const baseUrl = process.env.BASE_URL || this.DEFAULT_BASE_URL;

    return {
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      targetUrl: url.targetUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    };
  }

  async updateOneUrl(userId: string, body: UpdateUrlDto): Promise<ListUrlDto> {
    this.logger.log('Iniciando atualização de URL');

    const { newUrl, shortCode } = body;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['urls'],
    });

    if (!user) {
      this.logger.error('Usuário não encontrado');

      throw new NotFoundException('Usuário não encontrado');
    }

    const url = user.urls.find((url) => url.shortCode === shortCode && !url.deletedAt);

    if (!url) {
      this.logger.error('URL não encontrada');

      throw new NotFoundException('URL não encontrada');
    }

    url.targetUrl = newUrl;

    try {
      this.logger.log('Atualizando URL');

      await this.urlRepository.save(url);
    } catch (error) {
      this.logger.error('Erro ao atualizar a URL', error);

      throw new BadRequestException('Erro ao atualizar a URL');
    }

    const baseUrl = process.env.BASE_URL || this.DEFAULT_BASE_URL;

    return {
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      targetUrl: url.targetUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    };
  }

  async deleteOneUrl(userId: string, body: DeleteUrlDto): Promise<ListUrlDto> {
    this.logger.log('Iniciando exclusão de URL');

    const { shortCode } = body;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['urls'],
    });

    if (!user) {
      this.logger.error('Usuário não encontrado');

      throw new NotFoundException('Usuário não encontrado');
    }

    const url = user.urls.find((url) => url.shortCode === shortCode && !url.deletedAt);

    if (!url) {
      this.logger.error('URL não encontrada');

      throw new NotFoundException('URL não encontrada');
    }

    url.deletedAt = new Date();

    try {
      this.logger.log(`Marcando URL como deletada: ${shortCode}`);

      await this.urlRepository.save(url);
    } catch (error) {
      this.logger.error('Erro ao realizar exclusão lógica da URL', error);

      throw new BadRequestException('Erro ao deletar a URL');
    }

    const baseUrl = process.env.BASE_URL || this.DEFAULT_BASE_URL;

    return {
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      targetUrl: url.targetUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      deletedAt: url.deletedAt,
    };
  }
}
