import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantId } from '../auth/auth.service';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createRole(@TenantId() tenantId: string, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(tenantId, dto);
  }

  @Get()
  getRoles(@TenantId() tenantId: string) {
    return this.rolesService.findAll(tenantId);
  }

  @Get('permissions')
  getPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Get(':roleId')
  getRole(@TenantId() tenantId: string, @Param('roleId') roleId: string) {
    return this.rolesService.findOne(roleId, tenantId);
  }

  @Put(':roleId')
  updateRole(
    @TenantId() tenantId: string,
    @Param('roleId') roleId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(roleId, tenantId, dto);
  }

  @Delete(':roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRole(@TenantId() tenantId: string, @Param('roleId') roleId: string) {
    return this.rolesService.delete(roleId, tenantId);
  }
}

