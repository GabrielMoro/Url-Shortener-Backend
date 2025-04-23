import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UrlService } from './services/url/url.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { CreateUrlDto } from './dtos/create-url.dto';
import { OptionalAuthGuard } from '@/infra/guard/optional-auth.guard';
import { User } from '../user/entities/user.entity';
import { ShortenedUrlReturnDto } from './dtos/shortened-url-return.dto';

@ApiTags('url')
@UseGuards(OptionalAuthGuard)
@Controller('url')
export class UrlController {
  public constructor(private readonly urlService: UrlService) {}

  @ApiOperation({ summary: 'Encurtar uma URL' })
  @ApiBody({ type: CreateUrlDto, description: 'Dados para encurtamento da URL' })
  @ApiResponse({
    status: 201,
    description: 'URL encurtada com sucesso',
    type: ShortenedUrlReturnDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @Post('')
  async shorten(
    @Body() input: CreateUrlDto,
    @GetUser() user: User,
  ): Promise<ShortenedUrlReturnDto> {
    return this.urlService.shorten(input, user);
  }
}
