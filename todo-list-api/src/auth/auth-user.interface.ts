import type { Role } from '../users/entities/user.entity.js';

/**
 * The shape of the JWT payload we sign at login, and what JwtStrategy.validate()
 * returns as `req.user`. This is a SNAPSHOT taken at sign-time — not a live DB
 * record. Keep only non-secret identifiers here (id, role).
 */
export interface AuthUser {
  id: string;
  role: Role;
}

/** The raw claims as they live inside the signed token. */
export interface JwtPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}
