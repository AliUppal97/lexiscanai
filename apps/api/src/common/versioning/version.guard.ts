import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VersionService } from './version.service';

export const API_VERSION_KEY = 'apiVersion';

/**
 * Extract API version from request
 */
@Injectable()
export class VersionGuard implements CanActivate {
  constructor(
    private versionService: VersionService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extract version from URL, header, or query param
    let version = this.extractVersionFromUrl(request.url);
    
    if (!version) {
      version = request.headers['x-api-version'];
    }
    
    if (!version) {
      version = request.query?.version;
    }
    
    // Default to latest if not specified
    if (!version) {
      version = await this.versionService.getLatestVersion();
    }
    
    // Store version in request
    request.apiVersion = version;
    
    // Check if version is deprecated
    const versionInfo = await this.versionService.getVersion(version);
    if (versionInfo?.status === 'DEPRECATED' || versionInfo?.status === 'SUNSET') {
      request.apiVersionDeprecated = true;
      request.apiVersionSunsetDate = versionInfo.sunsetDate;
    }
    
    return true;
  }

  /**
   * Extract version from URL (e.g., /api/v1/users -> v1)
   */
  private extractVersionFromUrl(url: string): string | null {
    const match = url.match(/\/api\/(v\d+)/);
    return match ? match[1] : null;
  }
}

