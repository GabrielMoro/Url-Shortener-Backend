import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [AuthGuard, JwtService],
  exports: [AuthGuard, JwtService],
})
export class AuthModule {}
