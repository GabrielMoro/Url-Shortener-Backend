import { Logger, Module } from '@nestjs/common';
import { RedirectController } from './redirect.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from '../url/entities/url.entity';
import { UrlService } from '../url/services/url/url.service';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  controllers: [RedirectController],
  providers: [UrlService, Logger],
})
export class RedirectModule {}
