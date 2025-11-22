import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EmailTemplate, EmailTemplateType } from '@prisma/client';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create email template
   */
  async createTemplate(tenantId: string | null, dto: any): Promise<EmailTemplate> {
    const template = await this.prisma.emailTemplate.create({
      data: {
        name: dto.name,
        type: dto.type,
        subject: dto.subject,
        body: dto.body,
        variables: dto.variables || {},
        tenantId,
      },
    });

    return template;
  }

  /**
   * Update email template
   */
  async updateTemplate(id: string, tenantId: string | null, dto: any): Promise<EmailTemplate> {
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!template) {
      throw new Error(`Template ${id} not found`);
    }

    return this.prisma.emailTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        subject: dto.subject,
        body: dto.body,
        variables: dto.variables,
      },
    });
  }

  /**
   * Render template with variables
   */
  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<{ subject: string; body: string }> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let subject = template.subject;
    let body = template.body;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    }

    return { subject, body };
  }

  /**
   * Send email using template
   */
  async sendEmail(templateId: string, to: string, variables: Record<string, any>): Promise<void> {
    const { subject, body } = await this.renderTemplate(templateId, variables);

    // TODO: Integrate with email service
    this.logger.debug(`Sending email to ${to} with subject: ${subject}`);
  }
}

