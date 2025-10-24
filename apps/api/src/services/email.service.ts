import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
}

export interface EmailTemplate {
  template: string;
  variables: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly enabled: boolean;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('FROM_EMAIL', 'noreply@lexiscan.ai');
    this.fromName = this.configService.get<string>('FROM_NAME', 'LexiScan AI');
    this.enabled = !!this.configService.get<string>('SMTP_HOST');

    if (this.enabled) {
      this.initializeTransporter();
    } else {
      this.logger.warn('Email service is not configured. Emails will not be sent.');
    }
  }

  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize email transporter: ${error.message}`);
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn('Email service disabled. Email not sent:', options.subject);
      return false;
    }

    try {
      const mailOptions = {
        from: options.from || `"${this.fromName}" <${this.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully: ${options.subject} to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  /**
   * Send bulk emails (with rate limiting)
   */
  async sendBulkEmails(emails: EmailOptions[]): Promise<{
    sent: number;
    failed: number;
  }> {
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        await this.sendEmail(email);
        sent++;
        // Rate limiting: wait 100ms between emails
        await this.delay(100);
      } catch (error) {
        this.logger.error(`Failed to send bulk email to ${email.to}`);
        failed++;
      }
    }

    this.logger.log(`Bulk email send complete. Sent: ${sent}, Failed: ${failed}`);

    return { sent, failed };
  }

  /**
   * Pre-built email templates
   */

  // Welcome email
  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const html = this.getWelcomeTemplate(userName);

    return this.sendEmail({
      to,
      subject: 'Welcome to LexiScan AI',
      html,
    });
  }

  // Password reset email
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName: string,
  ): Promise<boolean> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    const html = this.getPasswordResetTemplate(userName, resetUrl);

    return this.sendEmail({
      to,
      subject: 'Reset Your Password - LexiScan AI',
      html,
    });
  }

  // Email verification
  async sendVerificationEmail(
    to: string,
    verificationToken: string,
    userName: string,
  ): Promise<boolean> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`;
    const html = this.getVerificationTemplate(userName, verificationUrl);

    return this.sendEmail({
      to,
      subject: 'Verify Your Email - LexiScan AI',
      html,
    });
  }

  // Document processed notification
  async sendDocumentProcessedEmail(
    to: string,
    documentTitle: string,
    documentId: string,
  ): Promise<boolean> {
    const documentUrl = `${this.configService.get('FRONTEND_URL')}/dashboard/documents/${documentId}`;
    const html = this.getDocumentProcessedTemplate(documentTitle, documentUrl);

    return this.sendEmail({
      to,
      subject: `Document Processed: ${documentTitle}`,
      html,
    });
  }

  // Invoice email
  async sendInvoiceEmail(
    to: string,
    invoiceId: string,
    amount: number,
    currency: string,
  ): Promise<boolean> {
    const invoiceUrl = `${this.configService.get('FRONTEND_URL')}/dashboard/billing/invoices/${invoiceId}`;
    const html = this.getInvoiceTemplate(amount, currency, invoiceUrl);

    return this.sendEmail({
      to,
      subject: `Invoice #${invoiceId} - LexiScan AI`,
      html,
    });
  }

  // Subscription expiring notification
  async sendSubscriptionExpiringEmail(
    to: string,
    daysRemaining: number,
  ): Promise<boolean> {
    const renewUrl = `${this.configService.get('FRONTEND_URL')}/dashboard/billing`;
    const html = this.getSubscriptionExpiringTemplate(daysRemaining, renewUrl);

    return this.sendEmail({
      to,
      subject: `Your Subscription Expires in ${daysRemaining} Days`,
      html,
    });
  }

  // Team invitation email
  async sendTeamInvitationEmail(
    to: string,
    inviterName: string,
    organizationName: string,
    invitationToken: string,
  ): Promise<boolean> {
    const invitationUrl = `${this.configService.get('FRONTEND_URL')}/accept-invitation?token=${invitationToken}`;
    const html = this.getTeamInvitationTemplate(inviterName, organizationName, invitationUrl);

    return this.sendEmail({
      to,
      subject: `You've been invited to join ${organizationName}`,
      html,
    });
  }

  /**
   * Email Templates (HTML)
   */

  private getEmailLayout(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LexiScan AI</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .logo { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">⚡ LexiScan AI</div>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} LexiScan AI. All rights reserved.</p>
              <p>AI-Powered Legal Document Analysis</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeTemplate(userName: string): string {
    const content = `
      <h2>Welcome to LexiScan AI, ${userName}! 🎉</h2>
      <p>We're thrilled to have you on board. LexiScan AI is here to revolutionize your legal document workflow with AI-powered analysis.</p>
      <p><strong>Here's what you can do:</strong></p>
      <ul>
        <li>Upload and analyze legal documents</li>
        <li>Get instant AI-powered insights</li>
        <li>Collaborate with your team</li>
        <li>Manage compliance effortlessly</li>
      </ul>
      <a href="${this.configService.get('FRONTEND_URL')}/dashboard" class="button">Go to Dashboard</a>
      <p>If you have any questions, our support team is here to help!</p>
    `;
    return this.getEmailLayout(content);
  }

  private getPasswordResetTemplate(userName: string, resetUrl: string): string {
    const content = `
      <h2>Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `;
    return this.getEmailLayout(content);
  }

  private getVerificationTemplate(userName: string, verificationUrl: string): string {
    const content = `
      <h2>Verify Your Email Address</h2>
      <p>Hi ${userName},</p>
      <p>Thanks for signing up! Please verify your email address to get started:</p>
      <a href="${verificationUrl}" class="button">Verify Email</a>
      <p>Once verified, you'll have full access to all features.</p>
    `;
    return this.getEmailLayout(content);
  }

  private getDocumentProcessedTemplate(documentTitle: string, documentUrl: string): string {
    const content = `
      <h2>✅ Document Processing Complete</h2>
      <p>Your document "<strong>${documentTitle}</strong>" has been successfully processed.</p>
      <p>You can now view the analysis results and insights.</p>
      <a href="${documentUrl}" class="button">View Document</a>
    `;
    return this.getEmailLayout(content);
  }

  private getInvoiceTemplate(amount: number, currency: string, invoiceUrl: string): string {
    const content = `
      <h2>Invoice Ready</h2>
      <p>Your invoice is ready for payment.</p>
      <p><strong>Amount Due:</strong> ${currency.toUpperCase()} ${(amount / 100).toFixed(2)}</p>
      <a href="${invoiceUrl}" class="button">View Invoice</a>
      <p>Thank you for your business!</p>
    `;
    return this.getEmailLayout(content);
  }

  private getSubscriptionExpiringTemplate(daysRemaining: number, renewUrl: string): string {
    const content = `
      <h2>⚠️ Subscription Expiring Soon</h2>
      <p>Your subscription will expire in <strong>${daysRemaining} days</strong>.</p>
      <p>To continue enjoying uninterrupted service, please renew your subscription.</p>
      <a href="${renewUrl}" class="button">Renew Subscription</a>
    `;
    return this.getEmailLayout(content);
  }

  private getTeamInvitationTemplate(
    inviterName: string,
    organizationName: string,
    invitationUrl: string,
  ): string {
    const content = `
      <h2>You're Invited!</h2>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on LexiScan AI.</p>
      <p>Accept the invitation to collaborate on documents and access shared resources.</p>
      <a href="${invitationUrl}" class="button">Accept Invitation</a>
    `;
    return this.getEmailLayout(content);
  }

  /**
   * Utility methods
   */

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Email connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error(`Email connection verification failed: ${error.message}`);
      return false;
    }
  }
}

