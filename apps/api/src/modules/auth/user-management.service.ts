import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User, Tenant } from '@prisma/client';

export interface CreateTenantDto {
  name: string;
  slug: string;
  domain?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName?: string;
  adminLastName?: string;
}

@Injectable()
export class UserManagementService {
  constructor(private prisma: PrismaService) {}

  async createTenant(dto: CreateTenantDto): Promise<{ tenant: Tenant; admin: User }> {
    const { name, slug, domain, adminEmail, adminPassword, adminFirstName, adminLastName } = dto;

    // Check if tenant slug is available
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant slug already exists');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          domain,
        },
      });

      // Create admin user
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: adminFirstName,
          lastName: adminLastName,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          tenantId: tenant.id,
        },
      });

      return { tenant, admin };
    });
  }
}