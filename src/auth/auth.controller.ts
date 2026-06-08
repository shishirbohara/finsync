import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUsersDto, LoginDto, SignupDto } from './dto';
import { ApiResponse, successResponse } from 'src/common/response.util';
import { AuthResponse, PaginatedUsers } from './types/auth.types';
import type { UserProfile } from './types/auth.types';
import { JwtGuard } from './guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

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

  @Get('users')
  @UseGuards(JwtGuard)
  async getUsers(
    @Query() dto: GetUsersDto,
  ): Promise<ApiResponse<PaginatedUsers>> {
    const data = await this.authService.getUsers(dto);
    return successResponse('Users fetched successfully', data);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<UserProfile>> {
    return successResponse('User fetched successfully', user);
  }
}
