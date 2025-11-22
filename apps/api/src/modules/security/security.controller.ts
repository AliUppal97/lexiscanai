import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { DlpService } from './dlp.service';
import { DataClassificationService } from './data-classification.service';
import { ZeroTrustService } from './zero-trust.service';
import { DeviceTrustService } from './device-trust.service';
import { SoarService } from './soar.service';

@ApiTags('Security')
@ApiBearerAuth()
@Controller('security')
@UseGuards(EnhancedJwtAuthGuard)
export class SecurityController {
  constructor(
    private dlpService: DlpService,
    private dataClassificationService: DataClassificationService,
    private zeroTrustService: ZeroTrustService,
    private deviceTrustService: DeviceTrustService,
    private soarService: SoarService,
  ) {}

  @Get('dlp-policies')
  @ApiOperation({ summary: 'List DLP policies' })
  async listDlpPolicies(@Request() req: any): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Post('dlp-policies')
  @ApiOperation({ summary: 'Create DLP policy' })
  async createDlpPolicy(@Request() req: any, @Body() dto: any): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.dlpService.createPolicy(tenantId, dto);
  }

  @Get('dlp-policies/:id')
  @ApiOperation({ summary: 'Get DLP policy' })
  async getDlpPolicy(@Request() req: any, @Param('id') id: string): Promise<any> {
    // TODO: Implement get
    return {};
  }

  @Post('dlp-policies/:id/evaluate')
  @ApiOperation({ summary: 'Evaluate DLP policy' })
  async evaluateDlpPolicy(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { documentId: string; content: string },
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.dlpService.evaluatePolicy(dto.documentId, dto.content, tenantId);
  }

  @Get('classifications')
  @ApiOperation({ summary: 'List data classifications' })
  async listClassifications(@Request() req: any): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Post('classifications')
  @ApiOperation({ summary: 'Classify document' })
  async classifyDocument(
    @Request() req: any,
    @Body() dto: { documentId: string; content: string },
  ): Promise<any> {
    return this.dataClassificationService.classifyDocument(dto.documentId, dto.content);
  }

  @Get('device-trust')
  @ApiOperation({ summary: 'Get device trust' })
  async getDeviceTrust(@Request() req: any, @Body() dto: { deviceId: string }): Promise<any> {
    return this.deviceTrustService.getDeviceTrust(dto.deviceId);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'List security incidents' })
  async listIncidents(@Request() req: any): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Post('soar-playbooks')
  @ApiOperation({ summary: 'Create SOAR playbook' })
  async createPlaybook(@Request() req: any, @Body() dto: any): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.soarService.createPlaybook(tenantId, dto);
  }
}

