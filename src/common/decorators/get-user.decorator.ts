import { AuthRequest } from '@/infra/guard/authorization.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthRequest>();

  return request.user;
});
