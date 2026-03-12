import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { getErrorMessage } from '@shared/types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login with email and password' })
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const result = await this.authService.login(dto.email, dto.password);
    if (!result.ok) {
      throw new HttpException(getErrorMessage(result.error), HttpStatus.UNAUTHORIZED);
    }
    return result.value;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const result = await this.authService.refresh(dto.refreshToken);
    if (!result.ok) {
      throw new HttpException(getErrorMessage(result.error), HttpStatus.UNAUTHORIZED);
    }
    return result.value;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(@Headers('authorization') authHeader: string): Promise<void> {
    const token = authHeader?.replace('Bearer ', '') ?? '';
    const result = await this.authService.logout(token);
    if (!result.ok) {
      throw new HttpException(getErrorMessage(result.error), HttpStatus.BAD_GATEWAY);
    }
  }
}
