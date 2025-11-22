import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AppTransactionType } from '@prisma/client';

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate commission
   */
  async calculateCommission(amount: number, appId: string): Promise<number> {
    const app = await this.prisma.marketplaceApp.findUnique({
      where: { id: appId },
      include: { developer: true },
    });

    if (!app) {
      throw new Error(`App ${appId} not found`);
    }

    const revenueShare = app.developer.revenueShare;
    const commission = amount * (1 - revenueShare); // Platform commission

    return commission;
  }

  /**
   * Process payment transaction
   */
  async processPayment(transaction: {
    appId: string;
    tenantId: string;
    amount: number;
    type: AppTransactionType;
  }): Promise<any> {
    const commission = await this.calculateCommission(transaction.amount, transaction.appId);

    const appTransaction = await this.prisma.appTransaction.create({
      data: {
        appId: transaction.appId,
        tenantId: transaction.tenantId,
        amount: transaction.amount,
        commission,
        type: transaction.type,
      },
    });

    // TODO: Process actual payment (Stripe, etc.)
    // TODO: Payout to developer

    return appTransaction;
  }

  /**
   * Get developer revenue
   */
  async getDeveloperRevenue(developerId: string): Promise<{
    totalRevenue: number;
    platformCommission: number;
    developerRevenue: number;
    transactions: number;
  }> {
    const apps = await this.prisma.marketplaceApp.findMany({
      where: { developerId },
      include: { transactions: true },
    });

    let totalRevenue = 0;
    let platformCommission = 0;
    let transactions = 0;

    for (const app of apps) {
      for (const transaction of app.transactions) {
        totalRevenue += transaction.amount;
        platformCommission += transaction.commission;
        transactions++;
      }
    }

    const developerRevenue = totalRevenue - platformCommission;

    return {
      totalRevenue,
      platformCommission,
      developerRevenue,
      transactions,
    };
  }

  /**
   * Payout developer
   */
  async payoutDeveloper(developerId: string): Promise<void> {
    const revenue = await this.getDeveloperRevenue(developerId);

    // TODO: Process payout (Stripe Connect, bank transfer, etc.)
    this.logger.log(`Paying out ${revenue.developerRevenue} to developer ${developerId}`);
  }
}

