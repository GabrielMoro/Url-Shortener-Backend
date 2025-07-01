import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { UrlDto } from './url.dto';

export class ListUrlDto {
  @ApiProperty({
    example: 1,
    description: 'Número total de itens disponíveis',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  totalEntries?: number;

  @ApiProperty({
    example: 1,
    description: 'Número da página atual',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({
    example: 1,
    description: 'Número da última página',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  lastPage?: number;

  @ApiProperty({
    example: [],
    description: 'Lista de URLs',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  data: UrlDto[];
}
