/**
 * Test Data Factory
 * 
 * Provides factory methods for creating test data objects.
 * Follows the Factory Pattern for consistent test data generation.
 */

import { faker } from '@faker-js/faker';

/**
 * User Factory
 */
export class UserFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: 'Test123!@#',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      isActive: true,
      role: 'USER',
      tenantId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Organization Factory
 */
export class OrganizationFactory {
  static create(overrides: Partial<any> = {}) {
    const name = faker.company.name();
    return {
      id: faker.string.uuid(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      status: 'ACTIVE',
      plan: 'PROFESSIONAL',
      maxUsers: 10,
      maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Document Factory
 */
export class DocumentFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      content: faker.lorem.paragraphs(3),
      filePath: `/documents/${faker.string.uuid()}.pdf`,
      mimeType: 'application/pdf',
      fileSize: faker.number.int({ min: 1000, max: 10000000 }),
      status: 'COMPLETED',
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Subscription Factory
 */
export class SubscriptionFactory {
  static create(overrides: Partial<any> = {}) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
      stripeSubscriptionId: `sub_${faker.string.alphanumeric(14)}`,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Invoice Factory
 */
export class InvoiceFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      subscriptionId: faker.string.uuid(),
      amount: faker.number.int({ min: 1000, max: 50000 }), // in cents
      currency: 'USD',
      status: 'PAID',
      stripeInvoiceId: `in_${faker.string.alphanumeric(14)}`,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Review Factory
 */
export class ReviewFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      documentId: faker.string.uuid(),
      userId: faker.string.uuid(),
      score: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
      feedback: faker.lorem.paragraph(),
      status: 'COMPLETED',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * API Key Factory
 */
export class ApiKeyFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.lorem.words(2),
      key: `lx_${faker.string.alphanumeric(32)}`,
      hashedKey: faker.string.alphanumeric(64),
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      scopes: ['documents:read', 'documents:write'],
      status: 'ACTIVE',
      lastUsedAt: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Webhook Factory
 */
export class WebhookFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      url: faker.internet.url(),
      events: ['document.created', 'document.processed'],
      secret: faker.string.alphanumeric(32),
      isActive: true,
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Audit Log Factory
 */
export class AuditLogFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      action: 'DOCUMENT_CREATED',
      resourceType: 'DOCUMENT',
      resourceId: faker.string.uuid(),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      metadata: { fileName: faker.system.fileName() },
      createdAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

