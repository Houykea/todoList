import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../users/entities/user.entity.js';

export const ROLES_KEY = 'roles';

/**
 * Attaches the roles allowed to hit a route. RolesGuard reads this metadata
 * and compares it against req.user.role (RBAC).
 *
 * Usage: @Roles(Role.ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
