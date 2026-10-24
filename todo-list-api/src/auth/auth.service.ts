import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository, LessThan } from 'typeorm';
import type { Response, CookieOptions } from 'express';
import * as argon2 from 'argon2';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import type { JwtPayload } from './auth-user.interface.js';

const REFRESH_COOKIE = 'refresh_token';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ---------------------------------------------------------------------------
  // Registration — argon2 hash, 409 if email taken, return only safe fields.
  // ---------------------------------------------------------------------------
  async signup(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (await this.usersRepository.existsBy({ email: normalizedEmail })) {
      // The unique index is the final guard; this is the friendly early check.
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await argon2.hash(password);
    const user = await this.usersRepository.save(
      this.usersRepository.create({ email: normalizedEmail, passwordHash }),
    );

    // Never return the user object as-is; pick safe fields only.
    return { id: user.id, email: user.email };
  }

  // ---------------------------------------------------------------------------
  // Credential check — select:false means we must list passwordHash explicitly.
  // Same error for wrong email and wrong password (no user enumeration).
  // ---------------------------------------------------------------------------
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email: email.trim().toLowerCase() },
      select: ['id', 'email', 'role', 'passwordHash'],
    });

    const ok =
      user && (await argon2.verify(user.passwordHash, password).catch(() => false));
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  // ---------------------------------------------------------------------------
  // Issue access + refresh tokens. Access goes in the JSON body (kept in memory
  // on the client); refresh goes in an HttpOnly cookie and is hashed in the DB.
  // ---------------------------------------------------------------------------
  async issueTokens(user: Pick<User, 'id' | 'role'>, res: Response) {
    const payload: JwtPayload = { sub: user.id, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    } as Parameters<JwtService['signAsync']>[1]);

    await this.persistRefreshToken(user.id, refreshToken);
    res.cookie(REFRESH_COOKIE, refreshToken, this.cookieOptions());

    return { accessToken };
  }

  // ---------------------------------------------------------------------------
  // Refresh flow: verify signature + lookup the stored hash, then ROTATE.
  // Reuse of an already-revoked token => revoke the whole family (theft signal).
  // ---------------------------------------------------------------------------
  async useRefresh(rawToken: string | undefined): Promise<User> {
    if (!rawToken) throw new UnauthorizedException('Missing refresh token');

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(rawToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find the matching stored row for this user by verifying the hash.
    const candidates = await this.refreshRepository.find({
      where: { userId: payload.sub },
    });

    let matched: RefreshToken | undefined;
    for (const row of candidates) {
      if (await argon2.verify(row.tokenHash, rawToken).catch(() => false)) {
        matched = row;
        break;
      }
    }

    if (!matched) throw new UnauthorizedException('Refresh token not recognized');

    if (matched.revoked) {
      // A retired token was replayed — treat as theft and kill all sessions.
      await this.revokeAll(payload.sub);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    // Rotation: retire the token that was just used.
    matched.revoked = true;
    await this.refreshRepository.save(matched);

    const user = await this.usersRepository.findOneByOrFail({ id: payload.sub });
    return user;
  }

  // ---------------------------------------------------------------------------
  // Logout — revoke every refresh token for the user and clear the cookie.
  // ---------------------------------------------------------------------------
  async revokeAll(userId: string) {
    await this.refreshRepository.update({ userId }, { revoked: true });
  }

  clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: this.cookieOptions().path });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  private async persistRefreshToken(userId: string, token: string) {
    const tokenHash = await argon2.hash(token);
    const decoded = this.jwtService.decode(token) as JwtPayload;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 3600 * 1000);

    await this.refreshRepository.save(
      this.refreshRepository.create({ userId, tokenHash, expiresAt }),
    );

    // Opportunistic cleanup of expired rows.
    await this.refreshRepository.delete({ expiresAt: LessThan(new Date()) });
  }

  private cookieOptions(): CookieOptions {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true, // JS cannot read it (XSS protection)
      secure: isProd, // HTTPS only in production
      sameSite: 'lax', // blocks most CSRF
      path: '/api/auth', // only sent to auth routes
      maxAge: 7 * 24 * 3600 * 1000, // 7 days
    };
  }
}
