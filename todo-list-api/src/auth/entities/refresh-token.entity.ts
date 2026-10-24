import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

/**
 * One row per issued refresh token.
 *
 * The raw refresh JWT is NEVER stored — only an argon2 hash of it, exactly
 * like a password. On refresh we look the row up, verify the hash, then mark
 * the row `revoked` (rotation). A revoked row that is presented again means
 * the token was copied/reused, so we revoke the whole family.
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // argon2 hash of the refresh token string.
  @Column()
  tokenHash: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  // Rotation / revocation flag. Once true the token can never be used again.
  @Column({ default: false })
  revoked: boolean;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
