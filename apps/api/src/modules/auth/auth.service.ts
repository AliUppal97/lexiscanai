import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, Tenant } from '@prisma/client';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface AuthResult {
  user: User;
  tenant: Tenant;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password, tenantSlug } = credentials;

    // Find tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { 
        email_tenantId: { email, tenantId: tenant.id },
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    if (!user.passwordHash || !await bcrypt.compare(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate access token
    const accessToken = await this.generateAccessToken(user, tenant);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user,
      tenant,
      accessToken,
    };
  }

  private async generateAccessToken(user: User, tenant: Tenant): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
    });
  }
}