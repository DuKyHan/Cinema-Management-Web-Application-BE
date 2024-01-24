import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ConfigType } from '@nestjs/config';
import { Role } from '../constants/role.constant';
import { IS_PUBLIC_KEY } from '../decorators';
import { ROLES_KEY } from '../decorators/role.decorator';
import authConfig from 'src/common/configs/subconfigs/auth.config';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(authConfig.KEY)
    private readonly authConfigApi: ConfigType<typeof authConfig>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.authConfigApi.disabled) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user.roles) {
      throw new UnauthorizedException(`Forbidden`);
    }

    if (user.roles.includes(Role.Operator)) {
      return true;
    }
    if (requiredRoles.some((role) => user.roles?.includes(role))) {
      return true;
    }

    throw new UnauthorizedException(`Forbidden`);
  }
}
