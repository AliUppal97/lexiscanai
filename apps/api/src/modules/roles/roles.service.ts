import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRoleDto): Promise<any> {
    // Check for duplicate name
    // const existing = await this.prisma.role.findFirst({
    //   where: { tenantId, name: dto.name },
    // });
    // if (existing) {
    //   throw new ConflictException('Role name already exists');
    // }

    // return await this.prisma.role.create({
    //   data: { ...dto, tenantId },
    // });

    this.logger.log(`Role created: ${dto.name} for tenant ${tenantId}`);
    return { id: 'role_mock_id', ...dto, createdAt: new Date() };
  }

  async findAll(tenantId: string): Promise<any[]> {
    // return await this.prisma.role.findMany({
    //   where: { tenantId, isActive: true },
    //   orderBy: { priority: 'desc' },
    // });
    return [];
  }

  async findOne(roleId: string, tenantId: string): Promise<any> {
    // const role = await this.prisma.role.findFirst({
    //   where: { id: roleId, tenantId },
    // });
    // if (!role) throw new NotFoundException('Role not found');
    return { id: roleId, name: 'Mock Role', permissions: [] };
  }

  async update(roleId: string, tenantId: string, dto: UpdateRoleDto): Promise<any> {
    // return await this.prisma.role.update({
    //   where: { id: roleId, tenantId },
    //   data: dto,
    // });
    this.logger.log(`Role updated: ${roleId}`);
    return { id: roleId, ...dto };
  }

  async delete(roleId: string, tenantId: string): Promise<void> {
    // await this.prisma.role.delete({ where: { id: roleId, tenantId } });
    this.logger.log(`Role deleted: ${roleId}`);
  }
}

