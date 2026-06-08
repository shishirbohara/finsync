import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';
import { ApiResponse, successResponse } from 'src/common/response.util';
import { AuthResponse } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto): Promise<ApiResponse<AuthResponse>> {
    const data = await this.authService.signup(dto);
    return successResponse('Account created successfully', data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const data = await this.authService.login(dto);
    return successResponse('Login successful', data);
  }
}
