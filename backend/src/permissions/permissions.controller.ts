import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SYSTEM_ROLES } from 'src/common/constants';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { PermissionsService } from './permissions.service';

@UseGuards(AuthGuard('jwt'), RoleGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Roles(SYSTEM_ROLES.ADMIN)
  @Get()
  async getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }
}
