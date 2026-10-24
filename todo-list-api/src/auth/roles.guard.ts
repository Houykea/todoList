import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from './decorators/roles.decorator.js';
import type { AuthUser } from './auth-user.interface.js';
import type { Role } from '../users/entities/user.entity.js';

/**
 * RBAC guard. Registered globally AFTER JwtAuthGuard (order = run order), so
 * req.user already exists. If a route declares @Roles(...), the user's role
 * must be in the allowed set, otherwise 403 Forbidden.
 *
 * Routes with no @Roles() metadata are allowed through (authn-only).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No role restriction declared -> allow (being logged in is enough).
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
