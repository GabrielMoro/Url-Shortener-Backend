import { Logger, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthorizationModule } from '@/infra/guard/authorization.module';
import { Url } from '../url/entities/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Url]), AuthorizationModule],
  providers: [UserService, Logger],
  controllers: [UserController],
})
export class UserModule {}
