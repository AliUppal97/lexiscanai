import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsController } from './workflows.controller';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowExecutorService } from './workflow-executor.service';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'workflows',
    }),
    AuthModule,
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowEngineService, WorkflowExecutorService, PrismaService],
  exports: [WorkflowEngineService, WorkflowExecutorService],
})
export class WorkflowsModule {}

