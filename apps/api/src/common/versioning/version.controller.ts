import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VersionService } from './version.service';

@ApiTags('API Versions')
@Controller('versions')
export class VersionController {
  constructor(private versionService: VersionService) {}

  @Get()
  @ApiOperation({ summary: 'List all API versions' })
  @ApiResponse({ status: 200, description: 'List of API versions' })
  async listVersions(): Promise<any[]> {
    // TODO: Implement list all versions
    return [];
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
}

