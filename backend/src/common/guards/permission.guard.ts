import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/strategy/jwt.strategy';
import { PermissionsService } from 'src/permissions/permissions.service';
import { TPermissionCode } from '../constants/permissions';
import { SYSTEM_ROLES } from '../constants';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp().getRequest<Request>();

    const user = ctx?.user as JwtPayload;
    const projectId = ctx.params.projectId as string;

    const requiredPermissions = this.reflector.getAllAndOverride<
      TPermissionCode[]
    >('permissions', [context.getHandler(), context.getClass()]);

    if (
      user.role === SYSTEM_ROLES.ADMIN ||
      !requiredPermissions ||
      requiredPermissions.length === 0 ||
      !projectId
    ) {
      return true; // No specific permissions required, allow access
    }

    const isGranted = await this.permissionsService.hasPermission(
      user.id,
      projectId,
      requiredPermissions,
    );

    if (!isGranted) {
      throw new ForbiddenException('Access denied!');
    }

    return true;
  }
}
