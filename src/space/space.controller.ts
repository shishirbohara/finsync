import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { ApiResponse, successResponse } from 'src/common/response.util';
import { SpaceMember, SpaceWithRole } from './types/space.types';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { UserProfile } from 'src/auth/types/auth.types';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { Space } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  CreateSpaceDto,
  GetSpacesDto,
  UpdateMemberRoleDto,
  UpdateSpaceDto,
} from './dto/index';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(
    @Body() createSpaceDto: CreateSpaceDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<SpaceWithRole>> {
    const data = await this.spaceService.create(createSpaceDto, user.id);
    return successResponse('Space created successfully', data);
  }

  @Get()
  async findAll(
    @Query() dto: GetSpacesDto,
  ): Promise<ApiResponse<PaginatedResult<Space>>> {
    const data = await this.spaceService.findAll(dto);
    return successResponse('Spaces fetched successfully', data);
  }

  @Get(':id/members')
  @UseGuards(JwtGuard)
  async findMembers(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
    @Query() dto: PaginationDto,
  ): Promise<ApiResponse<PaginatedResult<SpaceMember>>> {
    const data = await this.spaceService.findMembers(id, user.id, dto);
    return successResponse('Members fetched successfully', data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Space>> {
    const data = await this.spaceService.findOne(id);
    return successResponse('Space fetched succesfully', data);
  }

  @Patch(':id/members/:userId')
  @UseGuards(JwtGuard)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: UserProfile,
    @Body() dto: UpdateMemberRoleDto,
  ): Promise<ApiResponse<SpaceMember>> {
    const data = await this.spaceService.updateMemberRole(
      id,
      user.id,
      userId,
      dto,
    );
    return successResponse('Member role updated succesfully', data);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ): Promise<ApiResponse<SpaceWithRole>> {
    const data = await this.spaceService.update(id, user.id, updateSpaceDto);
    return successResponse('Space updated successfully', data);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<void> {
    await this.spaceService.removeMember(id, user.id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<Space>> {
    const data = await this.spaceService.remove(id, user.id);
    return successResponse('Space deleted successfully', data);
  }
}
