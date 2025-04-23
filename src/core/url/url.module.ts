import { Logger, Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './services/url/url.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { AuthorizationModule } from '@/infra/guard/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), AuthorizationModule],
  controllers: [UrlController],
  providers: [UrlService, Logger],
})
export class UrlModule {}
