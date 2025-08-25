import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { UserJWTPayload } from '@task-mgmt/shared-types';

const defaultExpiresIn = 3600; // 1 hour

@Injectable()
export class AuthService {
  // features:
  // 1. JWT token generation
  // 2. JWT token validation
  generateToken(payload: object, expiresIn: number = defaultExpiresIn): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn });
  }

  validateToken(token: string):
    | {
        success: true;
        data: UserJWTPayload;
      }
    | {
        success: false;
        error: string;
      } {
    try {
      const data = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as UserJWTPayload;
      return {
        success: true,
        data,
      };
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? `${error.name}: ${error.message}` : 'Invalid token';
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}
