import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/core/user/entities/user.entity';
import { AuthRequest, JwtPayload } from './authorization.interface';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      return true;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return true;
    }

    try {
      const decoded = this.jwtService.verify<JwtPayload>(token);
      request.user = decoded as Partial<User>;
    } catch {
      // Não é necessário lógica aqui
    }

    return true;
  }
}
