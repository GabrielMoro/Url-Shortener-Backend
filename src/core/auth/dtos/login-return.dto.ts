import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginReturnDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...@e8vmEn7DK',
    description:
      'Token JWT assinado, deve ser usado como Bearer Token para acessar rotas protegidas.',
  })
  @IsString()
  accessToken: string;
}
