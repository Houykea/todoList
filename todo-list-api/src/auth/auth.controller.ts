import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto, SignupDto } from './dto/auth.dto.js';
import { CurrentUser } from './current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import type { AuthUser } from './auth-user.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password);
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.issueTokens(user, res);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = (req.cookies as Record<string, string> | undefined)?.[
      'refresh_token'
    ];
    const user = await this.authService.useRefresh(token);
    return this.authService.issueTokens(user, res);
  }

  @HttpCode(204)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.revokeAll(user.id);
    this.authService.clearRefreshCookie(res);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
