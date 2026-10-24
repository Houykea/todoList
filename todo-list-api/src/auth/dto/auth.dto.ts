import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

/**
 * Input DTO + global ValidationPipe reject bad input with 400 before the
 * service runs. MaxLength(72) matches the bcrypt/argon2 practical limit.
 */
export class SignupDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(72)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
