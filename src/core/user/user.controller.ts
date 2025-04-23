import { AuthGuard } from '@/infra/guard/authorization.guard';
import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ListUrlDto } from './dtos/list-urls.dto';
import { UpdateUrlDto } from './dtos/update-url.dto';
import { DeleteUrlDto } from './dtos/delete-url.dto';

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
  @ApiParam({
    name: 'shortCode',
    description: 'Código único da URL encurtada a ser atualizada',
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

  @ApiOperation({
    summary: 'Atualizar o destino de uma URL encurtada',
  })
  @ApiResponse({
    status: 200,
    description: 'URL atualizada com sucesso.',
    type: ListUrlDto,
  })
  @ApiResponse({
    status: 404,
    description: 'URL não encontrado.',
  })
  @Patch('url')
  async updateOneUrl(@Body() body: UpdateUrlDto, @GetUser() user: User): Promise<ListUrlDto> {
    return this.userService.updateOneUrl(user.id, body);
  }

  @ApiOperation({ summary: 'Deleta uma URL do usuário pelo shortCode' })
  @ApiResponse({ status: 200, description: 'URL deletada com sucesso', type: ListUrlDto })
  @ApiResponse({ status: 404, description: 'Usuário ou URL não encontrados' })
  @ApiResponse({ status: 400, description: 'Erro ao deletar a URL' })
  @Delete('url')
  async deleteOneUrl(@Body() body: DeleteUrlDto, @GetUser() user: User): Promise<ListUrlDto> {
    return this.userService.deleteOneUrl(user.id, body);
  }
}
