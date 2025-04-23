import { AuthGuard } from '@/infra/guard/authorization.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
  async listUrls(@GetUser() user: User): Promise<ListUrlDto[]> {
    return this.userService.listUrls(user.id);
  }

  @ApiOperation({
    summary: 'Obter uma URL encurtada',
    description: 'Retorna uma URL encurtada específica com base no shortCode.',
  })
  @ApiResponse({
    status: 200,
    description: 'URL encontrada e retornada com sucesso.',
    type: ListUrlDto,
  })
  @ApiResponse({
    status: 404,
    description: 'URL não encontrada.',
  })
  @Get('url/:shortCode')
  async getOneUrl(
    @Param('shortCode') shortCode: string,
    @GetUser() user: User,
  ): Promise<ListUrlDto> {
    return this.userService.getUrlByShortCode(user.id, shortCode);
  }
}
