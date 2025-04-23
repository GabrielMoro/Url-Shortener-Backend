import { Module } from '@nestjs/common';
import { AuthModule } from './guard/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  exports: [AuthModule, DatabaseModule],
})
export class InfraModule {}
