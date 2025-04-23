import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UrlService } from './services/url/url.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { CreateUrlDto } from './dtos/create-url.dto';
import { OptionalAuthGuard } from '@/infra/guard/optional-auth.guard';
import { User } from '../user/entities/user.entity';

@ApiTags('url')
@UseGuards(OptionalAuthGuard)
@Controller('url')
export class UrlController {
  public constructor(private readonly urlService: UrlService) {}

  @Post('')
  async shorten(@Body() input: CreateUrlDto, @GetUser() user: User) {
    return this.urlService.shorten(input, user);
  }
}
