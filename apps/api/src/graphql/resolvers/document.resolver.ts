import { Resolver, Query, Mutation, Subscription, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Document, CreateDocumentInput, UpdateDocumentInput } from '../schema/document.schema';
import { DocumentsService } from '../../modules/documents/documents.service';
import { EnhancedJwtAuthGuard } from '../../modules/auth/enhanced-auth.guard';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver(() => Document)
@UseGuards(EnhancedJwtAuthGuard)
export class DocumentResolver {
  constructor(private documentsService: DocumentsService) {}

  @Query(() => [Document], { name: 'documents' })
  async getDocuments(@Context() context: any): Promise<Document[]> {
    const tenantId = context.req.user?.tenantId;
    const userId = context.req.user?.id;
    const documents = await this.documentsService.findAll(tenantId, userId, {});
    return documents.map((doc) => this.toGraphQL(doc));
  }

  @Query(() => Document, { name: 'document', nullable: true })
  async getDocument(@Args('id') id: string, @Context() context: any): Promise<Document | null> {
    const tenantId = context.req.user?.tenantId;
    const userId = context.req.user?.id;
    const document = await this.documentsService.findOne(id, tenantId, userId);
    return document ? this.toGraphQL(document) : null;
  }

  @Mutation(() => Document)
  async createDocument(
    @Args('input') input: CreateDocumentInput,
    @Context() context: any,
  ): Promise<Document> {
    const tenantId = context.req.user?.tenantId;
    const userId = context.req.user?.id;

    const document = await this.documentsService.create(tenantId, userId, {
      title: input.name,
      content: input.description || '',
      filePath: input.fileUrl,
      fileSize: input.fileSize,
      mimeType: input.fileType,
    });

    // Publish subscription event
    await pubSub.publish('documentCreated', { documentCreated: this.toGraphQL(document) });

    return this.toGraphQL(document);
  }

  @Mutation(() => Document)
  async updateDocument(
    @Args('id') id: string,
    @Args('input') input: UpdateDocumentInput,
    @Context() context: any,
  ): Promise<Document> {
    const tenantId = context.req.user?.tenantId;
    const userId = context.req.user?.id;
    const document = await this.documentsService.update(id, tenantId, userId, {
      title: input.name,
      content: input.description,
    });

    // Publish subscription event
    await pubSub.publish('documentUpdated', { documentUpdated: this.toGraphQL(document) });

    return this.toGraphQL(document);
  }

  @Subscription(() => Document, {
    name: 'documentCreated',
  })
  documentCreated() {
    return pubSub.asyncIterator('documentCreated');
  }

  @Subscription(() => Document, {
    name: 'documentUpdated',
    filter: (payload, variables) => {
      return payload.documentUpdated.id === variables.id;
    },
  })
  documentUpdated(@Args('id') id: string) {
    return pubSub.asyncIterator('documentUpdated');
  }

  private toGraphQL(doc: any): Document {
    return {
      id: doc.id,
      name: doc.title || '',
      description: doc.content || '',
      fileUrl: doc.filePath || '',
      fileType: doc.mimeType || '',
      fileSize: doc.fileSize || 0,
      status: doc.status || '',
      analysisResult: doc.analysisResult || null,
      tenantId: doc.tenantId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

