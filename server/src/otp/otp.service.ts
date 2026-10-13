import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly oauth2Client;
  private readonly senderEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GMAIL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GMAIL_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('GMAIL_REFRESH_TOKEN');
    this.senderEmail =
      this.configService.get<string>('GMAIL_USER') || 'arafatsohan2003@gmail.com';

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground',
    );

    if (refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });
    }
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

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save to user record
    await this.prisma.user.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt,
      },
    });

    this.logger.log(`Generated OTP for ${email}: ${otp}`);

    // Dispatch email using official Gmail API
    await this.sendGmailMessage(
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

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid verification code');
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

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

  private async sendGmailMessage(to: string, subject: string, htmlContent: string) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: "WA Gateway" <${this.senderEmail}>`,
        `To: <${to}>`,
        `Subject: ${utf8Subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        htmlContent,
      ];

      const rawMessage = messageParts.join('\r\n');
      const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      this.logger.log(`Gmail API message sent to: ${to} ✉️`);
    } catch (err: any) {
      this.logger.error('Failed to send email via Gmail API:', err?.response?.data || err?.message || err);
      throw new InternalServerErrorException(
        `Failed to dispatch verification email: ${err?.message || 'Gmail API error'}`,
      );
    }
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
