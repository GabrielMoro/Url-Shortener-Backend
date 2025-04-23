import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ListUrlDto } from '../../dtos/list-urls.dto';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: Logger,
  ) {}

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

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

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

    const url = user.urls.find((url) => url.shortCode === shortCode);

    if (!url) {
      this.logger.error('URL não encontrada');

      throw new NotFoundException('URL não encontrada');
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return {
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      targetUrl: url.targetUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    };
  }
}
