import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthorizationModule } from '@/infra/guard/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthorizationModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
