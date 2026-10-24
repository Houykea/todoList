import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from './auth-user.interface.js';

/**
 * Pulls the authenticated user (set by JwtStrategy.validate -> req.user) out of
 * the request so handlers get clean, typed access instead of digging through
 * @Req() req: any.
 *
 * Only works on routes behind the JwtAuthGuard; otherwise req.user is undefined.
 *
 * Usage: me(@CurrentUser() user: AuthUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    return request.user;
  },
);
