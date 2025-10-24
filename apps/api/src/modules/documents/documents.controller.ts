import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  QueryDocumentsDto,
  UploadDocumentDto,
} from './dto';
import { Document } from '@prisma/client';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ): Promise<Document> {
    const { tenantId, user } = req;
    return this.documentsService.uploadAndCreate(file, dto.title, tenantId, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a document record' })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
  })
  async create(
    @Req() req: any,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    const { tenantId, user } = req;
    return this.documentsService.create(tenantId, user.id, createDocumentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all documents' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of documents',
  })
  async findAll(
    @Req() req: any,
    @Query() query: QueryDocumentsDto,
  ): Promise<{
    documents: Document[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { tenantId, user } = req;
    return this.documentsService.findAll(tenantId, user.id, query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns document statistics',
  })
  async getStatistics(@Req() req: any): Promise<any> {
    const tenantId = req.tenantId;
    return this.documentsService.getStatistics(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns document details',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async findOne(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<Document> {
    const { tenantId, user } = req;
    return this.documentsService.findOne(tenantId, id, user.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get document download URL' })
  @ApiResponse({
    status: 200,
    description: 'Returns download URL',
  })
  async getDownloadUrl(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<{ url: string }> {
    const { tenantId, user } = req;
    return this.documentsService.getDownloadUrl(tenantId, id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
  })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    const { tenantId, user } = req;
    return this.documentsService.update(tenantId, id, user.id, updateDocumentDto);
  }

  @Post(':id/reprocess')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reprocess a document' })
  @ApiResponse({
    status: 200,
    description: 'Document reprocessing started',
  })
  async reprocess(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<Document> {
    const { tenantId, user } = req;
    return this.documentsService.reprocess(tenantId, id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({
    status: 204,
    description: 'Document deleted successfully',
  })
  async remove(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<void> {
    const { tenantId, user } = req;
    return this.documentsService.remove(tenantId, id, user.id);
  }
}

