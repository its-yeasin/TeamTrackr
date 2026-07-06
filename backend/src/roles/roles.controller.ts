import { Controller, Get } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Get all available project roles
  @Get('available')
  async getProjectRoles() {
    return await this.rolesService.getProjectRoles();
  }
}
