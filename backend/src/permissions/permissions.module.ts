import { Global, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { RolePermissionsController } from './role-permissions.controller';
import { ProjectContextResolver } from './permission.resolver';

@Global()
@Module({
  providers: [PermissionsService, ProjectContextResolver],
  exports: [PermissionsService, ProjectContextResolver],
  controllers: [PermissionsController, RolePermissionsController],
})
export class PermissionsModule {}
