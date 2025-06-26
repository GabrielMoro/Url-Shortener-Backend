import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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

  public async shorten(input: CreateUrlDto, user?: User): Promise<ShortenedUrlReturnDto> {
    this.logger.log('Iniciando encurtamento de URL');
    this.logger.log('Usuário autenticado:', user);

    const userPromise = user?.id
      ? this.userRepository.findOne({
          where: { id: user.id },
        })
      : undefined;

    try {
      const [shortCode, userEntity] = await Promise.all([
        this.generateUniqueShortCode(6),
        userPromise,
      ]);

      this.logger.log(`Código gerado: ${shortCode}`);

      const urlEntry: Partial<Url> = {
        targetUrl: input.targetUrl,
        shortCode,
        user: userEntity ?? undefined,
      };
      const url = this.urlRepository.create(urlEntry);

      await this.urlRepository.save(url);

      const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

      this.logger.log('URL encurtada', urlEntry);

      return {
        shortUrl: `${baseUrl}/${shortCode}`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.error('Erro ao gerar código para URL:', error.message, error.stack);

        throw error;
      }

      this.logger.error(
        'Erro inesperado ao encurtar URL:',
        (error as Error).message,
        (error as Error).stack,
      );

      throw new InternalServerErrorException('Erro inesperado ao encurtar URL');
    }
  }

  private async generateUniqueShortCode(lenght: number): Promise<string> {
    this.logger.log(`Gerando código curto único de ${lenght} caracteres`);
    const MaxAttempts = 10;

    let shortCode: string;

    for (let attempts = 0; attempts < MaxAttempts; attempts++) {
      shortCode = generateHash(lenght);

      const existingUrl = await this.urlRepository.findOne({
        where: { shortCode, deletedAt: IsNull() },
      });

      if (!existingUrl) {
        return shortCode;
      }
    }

    throw new BadRequestException(
      'Não foi possível gerar um código curto único após número máximo de tentativas',
    );
  }

  public async redirect(shortCode: string): Promise<string> {
    this.logger.log('Iniciando lógica de redirecionamento');

    const url = await this.urlRepository.findOne({
      where: {
        shortCode,
        deletedAt: IsNull(),
      },
    });

    if (!url) {
      this.logger.warn('URL não encontrada', shortCode);

      throw new NotFoundException('URL não encontrada');
    }

    try {
      url.clicks += 1;
      await this.urlRepository.save(url);

      return url.targetUrl;
    } catch (error: unknown) {
      this.logger.error(
        `Erro interno ao redirecionar para ${shortCode}:`,
        (error as Error).message,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Falha ao redirecionar para a URL');
    }
  }
}
