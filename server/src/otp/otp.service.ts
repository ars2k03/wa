import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly resend: Resend;
  private readonly mailFrom: string;
  private readonly failedAttempts = new Map<string, number>();
  private readonly MAX_OTP_ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.mailFrom =
      this.configService.get<string>('MAIL_FROM') || 'WA Gateway <onboarding@resend.dev>';
  }

  async sendOtp(body: SendOtpDto | string): Promise<{ success: boolean; message: string }> {
    const email = typeof body === 'string' ? body : body.email;

    // Verify user exists in database
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email address');
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = randomInt(100000, 1000000).toString();
    const hashedOtp = createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Reset any previous failed attempts when a fresh OTP is dispatched
    this.failedAttempts.delete(email.toLowerCase());

    // Save hashed OTP to user record
    await this.prisma.user.update({
      where: { email },
      data: {
        otpCode: hashedOtp,
        otpExpiresAt: expiresAt,
      },
    });

    this.logger.log(`Dispatched verification OTP to email: ${email}`);

    // Dispatch email via Resend
    await this.sendEmail(
      email,
      'Verification Code - WA Gateway',
      this.buildOtpHtml(otp),
    );

    return {
      success: true,
      message: 'Verification code sent successfully to your email',
    };
  }

  async verifyOtp(body: VerifyOtpDto): Promise<{ success: boolean; message: string }> {
    const { email, otp } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otpCode) {
      throw new BadRequestException('No verification code was requested or code has already been used');
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

    const emailKey = email.toLowerCase();
    const currentAttempts = this.failedAttempts.get(emailKey) || 0;

    if (currentAttempts >= this.MAX_OTP_ATTEMPTS) {
      await this.prisma.user.update({
        where: { email },
        data: { otpCode: null, otpExpiresAt: null },
      });
      this.failedAttempts.delete(emailKey);
      throw new BadRequestException(
        'Too many failed verification attempts. This code has been invalidated. Please request a new code.',
      );
    }

    const incomingHash = createHash('sha256').update(otp).digest('hex');
    const isCodeMatch =
      user.otpCode.length === incomingHash.length &&
      timingSafeEqual(Buffer.from(user.otpCode), Buffer.from(incomingHash));

    if (!isCodeMatch) {
      const newAttempts = currentAttempts + 1;
      this.failedAttempts.set(emailKey, newAttempts);

      if (newAttempts >= this.MAX_OTP_ATTEMPTS) {
        await this.prisma.user.update({
          where: { email },
          data: { otpCode: null, otpExpiresAt: null },
        });
        this.failedAttempts.delete(emailKey);
        throw new BadRequestException(
          'Too many failed verification attempts. This code has been invalidated. Please request a new code.',
        );
      }

      const remaining = this.MAX_OTP_ATTEMPTS - newAttempts;
      throw new BadRequestException(
        `Invalid verification code. You have ${remaining} attempt(s) remaining.`,
      );
    }

    // Reset failed attempts on successful verification
    this.failedAttempts.delete(emailKey);

    // Mark as verified & clear OTP
    await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    this.logger.log(`Account verified successfully for ${email} ✅`);

    return {
      success: true,
      message: 'Email verified successfully. You can now log in.',
    };
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const { error } = await this.resend.emails.send({
      from: this.mailFrom,
      to,
      subject,
      html,
    });

    if (error) {
      this.logger.error('Failed to send email via Resend:', error);
      throw new InternalServerErrorException(
        `Failed to dispatch verification email: ${error.message || 'Resend error'}`,
      );
    }

    this.logger.log(`Resend message sent to: ${to} ✉️`);
  }

  private buildOtpHtml(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fbf8f1; margin: 0; padding: 24px; color: #1a1a1a; }
          .container { max-width: 480px; margin: 0 auto; background: #ffffff; border: 2px solid #1a1a1a; padding: 32px; box-shadow: 6px 6px 0px #1a1a1a; }
          .header { font-size: 22px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; color: #1a1a1a; }
          .subtitle { font-size: 14px; color: #524d43; margin-bottom: 24px; line-height: 1.5; }
          .otp-box { background: #ede5d3; border: 2px dashed #1a1a1a; padding: 18px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1a1a1a; }
          .expiry { font-size: 12px; color: #7a2020; font-weight: bold; margin-top: 8px; }
          .footer { font-size: 12px; color: #8c8270; margin-top: 24px; border-top: 1px solid #ede5d3; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">WA Gateway Verification</div>
          <div class="subtitle">Please use the verification code below to complete your account registration:</div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">Expires in 10 minutes</div>
          </div>
          <div class="subtitle">If you did not request this verification code, please ignore this email.</div>
          <div class="footer">WhatsApp OTP Gateway &bull; Secure Authentication Service</div>
        </div>
      </body>
      </html>
    `;
  }
}
