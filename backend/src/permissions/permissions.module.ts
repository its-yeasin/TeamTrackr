import { Global, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { RolePermissionsController } from './role-permissions.controller';

@Global()
@Module({
  providers: [PermissionsService],
  exports: [PermissionsService],
  controllers: [PermissionsController, RolePermissionsController],
})
export class PermissionsModule {}
