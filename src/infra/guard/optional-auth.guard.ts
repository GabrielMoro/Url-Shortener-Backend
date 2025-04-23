/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/core/user/entities/user.entity';
import { AuthRequest, JwtPayload } from './authorization.interface';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    this.logger.log('OptionalAuthGuard');

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      this.logger.warn('Formato de token inválido');

      return true;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      this.logger.warn('Token inválido');

      return true;
    }

    try {
      this.logger.log('Token recebido');
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });
      this.logger.log('Token decodificado:', decoded);
      request.user = decoded as Partial<User>;
    } catch (err) {
      this.logger.error('Erro ao decodificar token:', err.message);
    }

    return true;
  }
}
