import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VersionService } from './version.service';
import { EnhancedJwtAuthGuard } from '../../modules/auth/enhanced-auth.guard';

@ApiTags('API Versions')
@Controller('versions')
export class VersionController {
  constructor(private versionService: VersionService) {}

  @Get()
  @ApiOperation({ summary: 'List all API versions' })
  @ApiResponse({ status: 200, description: 'List of API versions' })
  async listVersions(): Promise<any[]> {
    return this.versionService.listVersions();
  }

  @Get(':version')
  @ApiOperation({ summary: 'Get API version information' })
  @ApiResponse({ status: 200, description: 'API version information' })
  async getVersion(@Param('version') version: string): Promise<any> {
    return this.versionService.getVersion(version);
  }

  @Get(':version/migration-guide')
  @ApiOperation({ summary: 'Get migration guide' })
  @ApiResponse({ status: 200, description: 'Migration guide' })
  async getMigrationGuide(
    @Param('version') version: string,
    @Query('from') fromVersion?: string,
  ): Promise<any> {
    if (!fromVersion) {
      return { message: 'from parameter required' };
    }
    const guide = await this.versionService.getMigrationGuide(fromVersion, version);
    return { guide };
  }

  @Get(':version/changelog')
  @ApiOperation({ summary: 'Get changelog for version' })
  @ApiResponse({ status: 200, description: 'Changelog' })
  async getChangelog(@Param('version') version: string): Promise<any> {
    const versionInfo = await this.versionService.getVersion(version);
    return { changelog: versionInfo?.changelog || {} };
  }

  @Get(':version/usage')
  @ApiOperation({ summary: 'Get usage statistics for version' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  async getUsageStatistics(
    @Param('version') version: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const period = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : undefined;
    return this.versionService.getUsageStatistics(version, period);
  }

  @Get(':version/users')
  @ApiOperation({ summary: 'Get tenants using version' })
  @ApiResponse({ status: 200, description: 'List of tenants using version' })
  async getVersionUsers(@Param('version') version: string): Promise<any[]> {
    return this.versionService.getDeprecatedVersionUsers(version);
  }

  @Post(':version/deprecate')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deprecate version (admin only)' })
  @ApiResponse({ status: 200, description: 'Version deprecated' })
  async deprecateVersion(
    @Param('version') version: string,
    @Body() dto?: { deprecationDate?: string; sunsetDate?: string },
  ): Promise<any> {
    const deprecationDate = dto?.deprecationDate ? new Date(dto.deprecationDate) : undefined;
    const sunsetDate = dto?.sunsetDate ? new Date(dto.sunsetDate) : undefined;
    return this.versionService.deprecateVersion(version, deprecationDate, sunsetDate);
  }

  @Get(':version/migration-progress')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get migration progress for tenant' })
  @ApiResponse({ status: 200, description: 'Migration progress' })
  async getMigrationProgress(
    @Param('version') version: string,
    @Query('tenantId') tenantId: string,
  ): Promise<any> {
    return this.versionService.getMigrationProgress(tenantId, version);
  }

  @Get('deprecated')
  @ApiOperation({ summary: 'List deprecated versions' })
  @ApiResponse({ status: 200, description: 'List of deprecated versions' })
  async listDeprecatedVersions(): Promise<any[]> {
    return this.versionService.listDeprecatedVersions();
  }

  @Post('migration-guide')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create migration guide' })
  @ApiResponse({ status: 201, description: 'Migration guide created' })
  async createMigrationGuide(
    @Body() dto: { fromVersion: string; toVersion: string; changes: Array<{ type: string; description: string; example?: string }> },
  ): Promise<{ guide: string }> {
    const guide = await this.versionService.createMigrationGuide(
      dto.fromVersion,
      dto.toVersion,
      dto.changes,
    );
    return { guide };
  }
}

