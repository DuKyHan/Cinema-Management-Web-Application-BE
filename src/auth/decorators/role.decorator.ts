import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { Role } from '../constants/role.constant';

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
