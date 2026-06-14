import { Space, SpaceRole } from '@prisma/client';

export interface SpaceWithRole extends Space {
  role: SpaceRole;
}

export interface SpaceMember {
  id: string;
  role: SpaceRole;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
