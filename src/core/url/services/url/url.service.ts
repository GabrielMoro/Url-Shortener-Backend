import { Injectable, Logger } from '@nestjs/common';
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
    private readonly logger: Logger,
  ) {}

  async shorten(input: CreateUrlDto, user?: User): Promise<ShortenedUrlReturnDto> {
    this.logger.log('Iniciando encurtamento de URL');

    const shortCode = generateHash(6);

    const urlEntry: Partial<Url> = {
      targetUrl: input.targetUrl,
      shortCode,
      user: user ?? undefined,
    };
    const url = this.urlRepository.create(urlEntry);

    await this.urlRepository.save(url);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return {
      shortUrl: `${baseUrl}/${shortCode}`,
    };
  }
}
