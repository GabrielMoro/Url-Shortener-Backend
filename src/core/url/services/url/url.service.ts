import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../../entities/url.entity';
import { CreateUrlDto } from '../../dtos/create-url.dto';
import { User } from '@/core/user/entities/user.entity';
import { ShortenedUrlReturnDto } from '../../dtos/shortened-url-return.dto';
import { generateHash } from '@/common/utils/hash.util';

@Injectable()
export class UrlService {
  public constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: Logger,
  ) {}

  async shorten(input: CreateUrlDto, user?: User): Promise<ShortenedUrlReturnDto> {
    this.logger.log('Iniciando encurtamento de URL');
    this.logger.log('Usuário autenticado:', user);

    const shortCode = generateHash(6);

    const userEntity = user?.id
      ? await this.userRepository.findOne({
          where: { id: user.id },
        })
      : undefined;

    this.logger.log('User Entity', userEntity);

    const urlEntry: Partial<Url> = {
      targetUrl: input.targetUrl,
      shortCode,
      user: userEntity ?? undefined,
    };
    const url = this.urlRepository.create(urlEntry);

    await this.urlRepository.save(url);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    this.logger.log('URL encurtada', urlEntry);

    return {
      shortUrl: `${baseUrl}/${shortCode}`,
    };
  }

  async redirect(shortCode: string): Promise<string> {
    this.logger.log('Iniciando lógica de redirecionamento');

    const url = await this.urlRepository.findOne({
      where: {
        shortCode,
        deletedAt: undefined,
      },
    });

    if (!url) {
      this.logger.error('URL não encontrada ou foi removida');

      throw new NotFoundException('URL não encontrada ou foi removida');
    }

    url.clicks += 1;
    await this.urlRepository.save(url);

    return url.targetUrl;
  }
}
