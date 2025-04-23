import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @ApiProperty({
    description: 'Código único da URL encurtada.',
    example: 'abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  shortCode: string;

  @ApiProperty({
    description: 'Novo destino para a URL encurtada.',
    example: 'https://new-target-url.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  newUrl: string;
}
