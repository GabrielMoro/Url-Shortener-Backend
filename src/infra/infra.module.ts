import { Module } from '@nestjs/common';
import { AuthorizationModule } from './guard/authorization.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthorizationModule, DatabaseModule],
  exports: [AuthorizationModule, DatabaseModule],
})
export class InfraModule {}
