import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/strategy/jwt.strategy';
import { PermissionsService } from 'src/permissions/permissions.service';
import { TPermissionCode } from '../constants/permissions';
import { SYSTEM_ROLES } from '../constants';
import { DATABASE_TOKEN } from 'src/database/database.module';
import type { TPgDatabase } from '../interfaces/db';
import { ProjectContextResolver } from 'src/permissions/permission.resolver';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
    private readonly projectContextResolver: ProjectContextResolver,
    @Inject(DATABASE_TOKEN) private readonly db: TPgDatabase,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp().getRequest<Request>();

    const user = ctx?.user as JwtPayload;

    const requiredPermissions = this.reflector.getAllAndOverride<
      TPermissionCode[]
    >('permissions', [context.getHandler(), context.getClass()]);

    if (
      user.role === SYSTEM_ROLES.ADMIN ||
      !requiredPermissions ||
      requiredPermissions.length === 0
    ) {
      return true;
    }

    const projectId = await this.projectContextResolver.resolveProjectId(ctx);

    if (!projectId) {
      return true;
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
