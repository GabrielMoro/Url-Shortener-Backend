import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShortenedUrlReturnDto {
  @ApiProperty({
    example: 'http://localhost/aZbKq7',
    description: 'Endereço encurtado acessível publicamente',
  })
  @IsUrl()
  shortUrl: string;
}
