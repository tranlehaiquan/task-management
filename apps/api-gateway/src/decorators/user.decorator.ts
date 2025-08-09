import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export type UserJWTPayload = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  iat: number;
  exp: number;
};

interface AuthenticatedRequest extends Request {
  user?: UserJWTPayload;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserJWTPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);

// // set metadata authenticate is optional
// export const IS_AUTH_OPTIONAL = 'IS_AUTH_OPTIONAL';
// export const AuthIsOptional = () => SetMetadata(IS_AUTH_OPTIONAL, true);
