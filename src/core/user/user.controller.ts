import { AuthGuard } from '@/infra/guard/authorization.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ListUrlDto } from './dtos/list-urls.dto';

@ApiTags('user')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Get('urls')
  async urls(@GetUser() user: User): Promise<ListUrlDto[]> {
    return this.userService.listUrls(user.id);
  }
}
