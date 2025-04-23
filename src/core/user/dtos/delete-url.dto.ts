import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class DeleteUrlDto {
  @ApiProperty({
    description: 'Código único da URL encurtada.',
    example: 'abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  shortCode: string;
}
