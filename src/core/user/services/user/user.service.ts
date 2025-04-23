import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Url } from '@/core/url/entities/url.entity';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listUrls(userId: string): Promise<Url[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['urls'],
    });

    return user?.urls || [];
  }
}
