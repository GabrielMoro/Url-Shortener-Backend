import { Body, Controller, Post } from '@nestjs/common';
import { UserCredentialsDTO } from './dtos/create-user.dto';
import { AuthService } from './services/auth/auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Email já cadastrado' })
  @Post('register')
  public register(@Body() input: UserCredentialsDTO) {
    return this.authService.register(input);
  }

  @ApiOperation({ summary: 'Realizar login' })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido, retorna o token de acesso',
    schema: {
      example: { accessToken: 'Bearer <token>' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  @Post('login')
  public login(@Body() input: UserCredentialsDTO) {
    return this.authService.login(input);
  }
}
