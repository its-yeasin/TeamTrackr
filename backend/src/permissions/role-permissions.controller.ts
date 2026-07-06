import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SYSTEM_ROLES } from 'src/common/constants';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { PermissionsService } from './permissions.service';

@UseGuards(AuthGuard('jwt'), RoleGuard)
@Controller('roles/permissions')
export class RolePermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Roles(SYSTEM_ROLES.ADMIN)
  @Get('')
  async getRolePermissions() {
    return this.permissionService.getRolePermissions();
  }
}
