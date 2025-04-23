import { AuthGuard } from '@/infra/guard/auth.guard';
import { Controller, UseGuards } from '@nestjs/common';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {}
