import { Module } from '@nestjs/common';
import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './core/user/user.module';
import { InfraModule } from './infra/infra.module';
import { UrlModule } from './core/url/controllers/url/url.module';
import { RedirectModule } from './core/url/controllers/redirect/redirect.module';

@Module({
  imports: [AuthModule, UserModule, UrlModule, InfraModule, RedirectModule],
})
export class AppModule {}
