import { Url } from '@/core/url/entities/url.entity';
import { User } from '@/core/user/entities/user.entity';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Url],
        synchronize: true,
        logging: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
