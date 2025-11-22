import * as DataLoader from 'dataloader';
import { PrismaService } from '../../common/prisma.service';

export class UserDataLoader {
  private readonly userLoader: DataLoader<string, any>;
  private readonly organizationLoader: DataLoader<string, any>;

  constructor(private prisma: PrismaService) {
    this.userLoader = new DataLoader<string, any>(async (userIds: readonly string[]) => {
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: [...userIds] },
        },
      });

      const userMap = new Map(users.map((user) => [user.id, user]));
      return userIds.map((id) => userMap.get(id) || null);
    });

    this.organizationLoader = new DataLoader<string, any>(async (tenantIds: readonly string[]) => {
      const tenants = await this.prisma.tenant.findMany({
        where: {
          id: { in: [...tenantIds] },
        },
      });

      const tenantMap = new Map(tenants.map((tenant) => [tenant.id, tenant]));
      return tenantIds.map((id) => tenantMap.get(id) || null);
    });
  }

  loadUser(userId: string): Promise<any> {
    return this.userLoader.load(userId);
  }

  loadOrganization(tenantId: string): Promise<any> {
    return this.organizationLoader.load(tenantId);
  }
}

