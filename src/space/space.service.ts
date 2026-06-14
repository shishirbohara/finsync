import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SpaceMember, SpaceWithRole } from './types/space.types';
import { Space, SpaceRole } from '@prisma/client';
import {
  CreateSpaceDto,
  GetSpacesDto,
  UpdateMemberRoleDto,
  UpdateSpaceDto,
} from './dto/index';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class SpaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createSpaceDto: CreateSpaceDto,
    userId: string,
  ): Promise<SpaceWithRole> {
    const [space] = await this.prisma.$transaction(async (tx) => {
      const space = await tx.space.create({
        data: {
          name: createSpaceDto.name,
          description: createSpaceDto.description,
          type: createSpaceDto.type,
        },
      });

      await tx.spaceUser.create({
        data: {
          spaceId: space.id,
          userId,
          role: SpaceRole.ADMIN,
        },
      });

      return [space];
    });

    return { ...space, role: SpaceRole.ADMIN };
  }

  async findAll(dto: GetSpacesDto): Promise<PaginatedResult<Space>> {
    const { limit, page } = dto;
    const skip = (page - 1) * limit;

    const [spaces, total] = await this.prisma.$transaction([
      this.prisma.space.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.space.count(),
    ]);

    return { data: spaces, limit, page, total };
  }

  async findOne(id: string): Promise<Space> {
    const space = await this.prisma.space.findUnique({
      where: {
        id,
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    return space;
  }

  async findMembers(
    spaceId: string,
    userId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResult<SpaceMember>> {
    const { page, limit } = dto;
    const skip = (page - 1) * limit;

    const requester = await this.prisma.spaceUser.findUnique({
      where: { userId_spaceId: { userId, spaceId } },
    });

    if (!requester) {
      throw new NotFoundException('Space not found');
    }

    const [members, total] = await this.prisma.$transaction([
      this.prisma.spaceUser.findMany({
        where: { spaceId },
        skip,
        take: limit,
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.spaceUser.count({ where: { spaceId } }),
    ]);

    return { data: members, total, page, limit };
  }

  async update(
    id: string,
    userId: string,
    updateSpaceDto: UpdateSpaceDto,
  ): Promise<SpaceWithRole> {
    const spaceUser = await this.prisma.spaceUser.findUnique({
      where: { userId_spaceId: { userId, spaceId: id } },
    });

    if (!spaceUser) {
      throw new NotFoundException('Space not found');
    }

    if (spaceUser.role !== SpaceRole.ADMIN) {
      throw new ForbiddenException('Only admins can update a space');
    }

    const space = await this.prisma.space.update({
      where: { id },
      data: {
        name: updateSpaceDto.name,
        description: updateSpaceDto.description,
      },
    });

    return { ...space, role: spaceUser.role };
  }

  async updateMemberRole(
    spaceId: string,
    requesterId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<SpaceMember> {
    const requester = await this.prisma.spaceUser.findUnique({
      where: { userId_spaceId: { userId: requesterId, spaceId } },
    });

    if (!requester) {
      throw new NotFoundException('Space not found');
    }

    if (requester.role !== SpaceRole.ADMIN) {
      throw new ForbiddenException('Only admins can change member roles');
    }

    const target = await this.prisma.spaceUser.findUnique({
      where: { userId_spaceId: { userId: targetUserId, spaceId } },
    });

    if (!target) {
      throw new NotFoundException('Member not found in this space');
    }

    if (requesterId === targetUserId) {
      throw new ForbiddenException('You cannnot change your own role');
    }

    return this.prisma.spaceUser.update({
      where: { userId_spaceId: { userId: targetUserId, spaceId } },
      data: { role: dto.role },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<Space> {
    const spaceUser = await this.prisma.spaceUser.findUnique({
      where: { userId_spaceId: { userId, spaceId: id } },
    });

    if (!spaceUser) {
      throw new NotFoundException('Space not found');
    }

    if (spaceUser.role !== SpaceRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete a space');
    }

    const deletedSpace = await this.prisma.space.delete({
      where: {
        id,
      },
    });

    return deletedSpace;
  }

  async removeMember(
    spaceId: string,
    requesterId: string,
    targetUserId: string,
  ): Promise<void> {
    const requester = await this.prisma.spaceUser.findUnique({
      where: { userId_spaceId: { userId: requesterId, spaceId } },
    });

    if (!requester) {
      throw new NotFoundException('Space not found');
    }

    if (requester.role !== SpaceRole.ADMIN) {
      throw new ForbiddenException('Only admins can remove members');
    }

    if (requesterId === targetUserId) {
      throw new ForbiddenException('You cannot remove yourself from the space');
    }

    const target = await this.prisma.spaceUser.findUnique({
      where: { userId_spaceId: { userId: targetUserId, spaceId } },
    });

    if (!target) {
      throw new NotFoundException('Member not found in this space');
    }

    await this.prisma.spaceUser.delete({
      where: { userId_spaceId: { userId: targetUserId, spaceId } },
    });
  }
}
