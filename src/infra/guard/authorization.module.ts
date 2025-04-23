import { Module } from '@nestjs/common';
import { AuthGuard } from './authorization.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [AuthGuard, JwtService],
  exports: [AuthGuard, JwtService],
})
export class AuthorizationModule {}
