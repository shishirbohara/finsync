import { SpaceRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsEnum(SpaceRole)
  role!: SpaceRole;
}
