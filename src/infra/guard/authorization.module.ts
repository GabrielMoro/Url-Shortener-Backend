import { Module } from '@nestjs/common';
import { AuthGuard } from './authorization.guard';
import { JwtService } from '@nestjs/jwt';
import { OptionalAuthGuard } from './optional-auth.guard';

@Module({
  providers: [AuthGuard, OptionalAuthGuard, JwtService],
  exports: [AuthGuard, OptionalAuthGuard, JwtService],
})
export class AuthorizationModule {}
