import { AuthGuard } from '@/infra/guard/authorization.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ListUrlDto } from './dtos/list-urls.dto';

@ApiTags('user')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Listar URLs encurtadas',
    description: 'Retorna todas as URLs encurtadas pelo usuário autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de URLs encurtadas retornada com sucesso.',
    type: [ListUrlDto],
  })
  @Get('urls')
  async urls(@GetUser() user: User): Promise<ListUrlDto[]> {
    return this.userService.listUrls(user.id);
  }
}
