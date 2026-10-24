import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { AuthUser, JwtPayload } from './auth-user.interface.js';

/**
 * Passport strategy for access tokens.
 *
 * 1. Reads the token from `Authorization: Bearer <token>`.
 * 2. Passport verifies the signature and `exp` using JWT_SECRET. A bad or
 *    expired token short-circuits with 401 before validate() runs.
 * 3. Whatever validate() returns becomes req.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    // Map the raw claims onto our typed AuthUser. This is the req.user snapshot.
    return { id: payload.sub, role: payload.role };
  }
}
