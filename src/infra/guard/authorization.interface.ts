import { Request } from 'express';
import { User } from '@/core/user/entities/user.entity';

export interface AuthRequest extends Request {
  user?: Partial<User>;
}

export interface JwtPayload {
  id: string;
  email: string;
}
