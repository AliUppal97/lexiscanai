import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DocumentResolver } from './resolvers/document.resolver';
import { DocumentsModule } from '../modules/documents/documents.module';
import { DocumentDataLoader } from './dataloaders/document.dataloader';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [
    NestGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
        },
      },
    }),
    DocumentsModule,
    AuthModule,
  ],
  providers: [DocumentResolver, DocumentDataLoader, PrismaService],
  exports: [DocumentDataLoader],
})
export class GraphQLModule {}

