import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsService } from './permissions.service';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { PERMISSION_CODES } from 'src/common/constants/permissions';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('roles/permissions')
export class RolePermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  // All roles and their associated permissions
  @Permissions(PERMISSION_CODES.PROJECT_ROLE_MANAGE)
  @Get()
  async getRolePermissions() {
    return this.permissionService.getRolePermissions();
  }
}
