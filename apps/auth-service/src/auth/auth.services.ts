import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

const defaultExpiresIn = 3600; // 1 hour

export type UserJWTPayload = {
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  // features:
  // 1. JWT token generation
  // 2. JWT token validation
  generateToken(payload: object, expiresIn: number = defaultExpiresIn): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn });
  }

  validateToken(token: string): object | null {
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as UserJWTPayload;
    } catch {
      return null;
    }
  }
}
