import { AuthGuard } from '@/infra/guard/authorization.guard';
import { Controller, UseGuards } from '@nestjs/common';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {}
