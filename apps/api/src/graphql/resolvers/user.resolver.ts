import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User, Organization, CreateUserInput, UpdateUserInput, CreateOrganizationInput, UpdateOrganizationInput } from '../schema/user.schema';
import { PrismaService } from '../../common/prisma.service';
import { EnhancedJwtAuthGuard } from '../../modules/auth/enhanced-auth.guard';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver(() => User)
@UseGuards(EnhancedJwtAuthGuard)
export class UserResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [User], { name: 'users' })
  async getUsers(@Context() context: any): Promise<User[]> {
    const tenantId = context.req.user?.tenantId;
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        isDeleted: false,
      },
      include: {
        tenant: true,
      },
    });
    return users.map((u) => this.toGraphQL(u));
  }

  @Query(() => User, { name: 'user', nullable: true })
  async getUser(@Args('id', { type: () => ID }) id: string, @Context() context: any): Promise<User | null> {
    const tenantId = context.req.user?.tenantId;
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
      include: {
        tenant: true,
      },
    });
    return user ? this.toGraphQL(user) : null;
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput, @Context() context: any): Promise<User> {
    const tenantId = context.req.user?.tenantId;
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        tenantId,
      },
      include: {
        tenant: true,
      },
    });

    await pubSub.publish('userCreated', { userCreated: this.toGraphQL(user) });
    return this.toGraphQL(user);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
    @Context() context: any,
  ): Promise<User> {
    const tenantId = context.req.user?.tenantId;
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        avatar: input.avatar,
      },
      include: {
        tenant: true,
      },
    });

    await pubSub.publish('userUpdated', { userUpdated: this.toGraphQL(user) });
    return this.toGraphQL(user);
  }

  private toGraphQL(user: any): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      tenantId: user.tenantId,
      tenant: user.tenant ? this.tenantToGraphQL(user.tenant) : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private tenantToGraphQL(tenant: any): Organization {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      logo: tenant.logo,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}

@Resolver(() => Organization)
@UseGuards(EnhancedJwtAuthGuard)
export class OrganizationResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => Organization, { name: 'organization' })
  async getOrganization(@Context() context: any): Promise<Organization> {
    const tenantId = context.req.user?.tenantId;
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          where: { isDeleted: false },
          take: 10,
        },
      },
    });

    if (!tenant) {
      throw new Error('Organization not found');
    }

    return this.toGraphQL(tenant);
  }

  @Mutation(() => Organization)
  async updateOrganization(
    @Args('input') input: UpdateOrganizationInput,
    @Context() context: any,
  ): Promise<Organization> {
    const tenantId = context.req.user?.tenantId;
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: input.name,
        domain: input.domain,
        logo: input.logo,
      },
    });

    return this.toGraphQL(tenant);
  }

  private toGraphQL(tenant: any): Organization {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      logo: tenant.logo,
      isActive: tenant.isActive,
      users: tenant.users?.map((u: any) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}

