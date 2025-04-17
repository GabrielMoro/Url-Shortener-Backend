import { Module } from '@nestjs/common';
import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './core/user/user.module';
import { UrlModule } from './core/url/url.module';
import { InfraModule } from './infra/infra.module';

@Module({
  imports: [AuthModule, UserModule, UrlModule, InfraModule],
})
export class AppModule {}
