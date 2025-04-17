import { Module } from '@nestjs/common';
import { AuthModule } from './guard/auth.module';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthModule, LoggerModule, DatabaseModule],
  exports: [AuthModule, LoggerModule, DatabaseModule],
})
export class InfraModule {}
