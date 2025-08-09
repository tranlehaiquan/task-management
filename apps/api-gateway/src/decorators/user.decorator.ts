import { createParamDecorator, ExecutionContext } from '@nestjs/common';

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

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserJWTPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();

    return request.user as UserJWTPayload;
  },
);

// // set metadata authenticate is optional
// export const IS_AUTH_OPTIONAL = 'IS_AUTH_OPTIONAL';
// export const AuthIsOptional = () => SetMetadata(IS_AUTH_OPTIONAL, true);
