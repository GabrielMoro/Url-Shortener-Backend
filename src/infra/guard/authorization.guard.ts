import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRequest, JwtPayload } from './authorization.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    this.logger.log('AuthGuard');

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authToken = request.headers['authorization'];

    if (!authToken || typeof authToken !== 'string') {
      this.logger.error('Token não fornecido');

      throw new UnauthorizedException('Token não fornecido');
    }

    const [type, token] = authToken.split(' ');

    if (type !== 'Bearer' || !token) {
      this.logger.error('Formato de token inválido');

      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      this.logger.log('Token recebido');

      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });
      request.user = decoded;
      return true;
    } catch {
      this.logger.error('Token inválido ou expirado');

      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
