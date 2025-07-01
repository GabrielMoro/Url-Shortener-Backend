import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString, IsUrl, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UrlDto {
  @ApiProperty({
    example: '213f0192-7264-4376-8fe6-24176536dd12',
    description: 'ID único da entrada',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    example: 'abc123',
    description: 'Código encurtado da URL',
  })
  @IsString()
  shortCode: string;

  @ApiProperty({
    example: 'http://localhost:3000/abc123',
    description: 'URL encurtada completa',
  })
  @IsUrl()
  shortUrl: string;

  @ApiProperty({
    example: 'https://www.example.com/algum-artigo',
    description: 'URL de destino original',
  })
  @IsUrl()
  targetUrl: string;

  @ApiProperty({
    example: 42,
    description: 'Número de cliques que a URL recebeu',
  })
  @IsInt()
  clicks: number;

  @ApiProperty({
    example: '2025-04-22T14:30:00.000Z',
    description: 'Data de criação da URL',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    example: '2025-04-22T14:30:00.000Z',
    description: 'Data de atualização da URL',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({
    example: '2025-04-22T14:30:00.000Z',
    description: 'Data de exclusão da URL',
  })
  @IsDate()
  @Type(() => Date)
  deletedAt?: Date;
}
