import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Session 3 — Authentication & Authorization schema.
 *
 * Adds:
 *   - users               (uuid id, unique email, passwordHash, role enum)
 *   - refresh_tokens       (hashed refresh tokens for rotation/revocation)
 *   - todo.ownerId column  + FK to users(id)
 *
 * Written to run on top of the existing Init migration, which created the
 * `todo` table without an owner.
 */
export class AddUsersAndRefreshTokens1792300000000
  implements MigrationInterface
{
  name = 'AddUsersAndRefreshTokens1792300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Role enum for users.role
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`,
    );

    // users table
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER',
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )`,
    );

    // refresh_tokens table
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tokenHash" character varying NOT NULL,
        "userId" uuid NOT NULL,
        "revoked" boolean NOT NULL DEFAULT false,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_refresh_tokens_user"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // todo.ownerId + FK
    await queryRunner.query(`ALTER TABLE "todo" ADD "ownerId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "todo" ADD CONSTRAINT "FK_todo_owner"
        FOREIGN KEY ("ownerId") REFERENCES "users"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "todo" DROP CONSTRAINT "FK_todo_owner"`,
    );
    await queryRunner.query(`ALTER TABLE "todo" DROP COLUMN "ownerId"`);

    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_user"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_userId"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);

    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
