import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ListUrlDto } from '../../dtos/list-urls.dto';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listUrls(userId: string): Promise<ListUrlDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['urls'],
    });

    if (!user?.urls) {
      return [];
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return user.urls.map((url) => ({
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      targetUrl: url.targetUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    }));
  }
}
