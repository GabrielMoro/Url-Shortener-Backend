import 'dotenv/config';
import { Logger, Module } from '@nestjs/common';
import { AuthGuard } from './authorization.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { OptionalAuthGuard } from './optional-auth.guard';

@Module({
  imports: [JwtModule],
  providers: [AuthGuard, OptionalAuthGuard, JwtService, Logger],
  exports: [AuthGuard, OptionalAuthGuard, JwtService, Logger],
})
export class AuthorizationModule {}
