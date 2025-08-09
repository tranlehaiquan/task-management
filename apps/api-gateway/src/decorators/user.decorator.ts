import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { CurrentUser as CurrentUserType } from '@task-mgmt/shared-types';

interface AuthenticatedRequest extends Request {
  user?: CurrentUserType;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserType | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);

// // set metadata authenticate is optional
// export const IS_AUTH_OPTIONAL = 'IS_AUTH_OPTIONAL';
// export const AuthIsOptional = () => SetMetadata(IS_AUTH_OPTIONAL, true);
