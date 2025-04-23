import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({ example: 'https://teddydigital.io/sobre/', description: 'URL a ser encurtada' })
  @IsUrl()
  targetUrl: string;
}
