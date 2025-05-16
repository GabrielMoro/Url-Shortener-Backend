import { Logger, Module } from '@nestjs/common';
import { RedirectController } from './redirect.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from '../../entities/url.entity';
import { UrlService } from '../../services/url/url.service';
import { User } from '../../../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url, User])],
  providers: [UrlService, Logger],
  controllers: [RedirectController],
})
export class RedirectModule {}
