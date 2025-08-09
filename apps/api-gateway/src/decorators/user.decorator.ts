import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserJWTPayload } from '@task-mgmt/shared-types';

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
