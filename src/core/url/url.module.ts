import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './services/url/url.service';

@Module({
  controllers: [UrlController],
  providers: [UrlService]
})
export class UrlModule {}
