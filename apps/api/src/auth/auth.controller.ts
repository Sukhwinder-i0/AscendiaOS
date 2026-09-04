import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { RegisterSchema, LoginSchema, UserPayload, AuthResponse } from '@studyos/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: unknown): Promise<AuthResponse> {
    const dto = RegisterSchema.parse(body);
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() body: unknown): Promise<AuthResponse> {
    const dto = LoginSchema.parse(body);
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: UserPayload): Promise<{ user: UserPayload }> {
    return { user };
  }
}
