import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../../entities/url.entity';

@Injectable()
export class UrlService {
  public constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}
}
