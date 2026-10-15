import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { OtpTemplateService } from '../src/otp_template/otp_template.service.js';
import { DEFAULT_OTP_TEMPLATE } from '../src/otp_template/otp_template.constants.js';
import { createOtpMessage } from '../src/whatsapp/template/template.js';

describe('OtpTemplateService', () => {
  let service: OtpTemplateService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = { otpTemplate: { findUnique: vi.fn() } };
    service = new OtpTemplateService(prismaMock);
  });

  describe('validate', () => {
    const base = { body: 'Your code is {{code}}', showCopyButton: true };

    it('accepts {{code}}, with or without spaces', () => {
      expect(service.validate(base).body).toBe('Your code is {{code}}');
      expect(() => service.validate({ ...base, body: 'Code: {{ code }}' })).not.toThrow();
    });

    it('requires {{code}}', () => {
      expect(() => service.validate({ ...base, body: 'No code here' })).toThrow(
        new BadRequestException('The message must include {{code}} where the OTP should appear'),
      );
    });

    it('rejects any other placeholder', () => {
      expect(() => service.validate({ ...base, body: 'Hi {{name}}, {{code}} {{name}}' })).toThrow(
        new BadRequestException('Only {{code}} can be used in the message. Remove: {{name}}'),
      );
    });

    it('rejects placeholders in the footer', () => {
      expect(() => service.validate({ ...base, footer: 'Code {{code}}' })).toThrow(BadRequestException);
    });

    it('turns an empty footer into null and defaults the button text', () => {
      const result = service.validate({ ...base, footer: '  ', copyButtonText: '' });
      expect(result.footer).toBeNull();
      expect(result.copyButtonText).toBe('Copy Code');
    });
  });

  describe('getEffectiveTemplate', () => {
    it('falls back to the default template', async () => {
      prismaMock.otpTemplate.findUnique.mockResolvedValue(null);
      await expect(service.getEffectiveTemplate('user-1')).resolves.toEqual(DEFAULT_OTP_TEMPLATE);
    });

    it('returns the custom template content', async () => {
      prismaMock.otpTemplate.findUnique.mockResolvedValue({
        id: 't1',
        userId: 'user-1',
        body: 'ShopBD code: {{code}}',
        footer: null,
        showCopyButton: false,
        copyButtonText: 'Copy',
      });
      await expect(service.getEffectiveTemplate('user-1')).resolves.toEqual({
        body: 'ShopBD code: {{code}}',
        footer: null,
        showCopyButton: false,
        copyButtonText: 'Copy',
      });
    });
  });
});

describe('createOtpMessage', () => {
  it('builds the default interactive message with footer and copy button', () => {
    const msg = createOtpMessage(' 482910 ', DEFAULT_OTP_TEMPLATE);
    const interactive = msg.documentWithCaptionMessage!.message!.interactiveMessage!;
    expect(interactive.body!.text).toBe('*482910* is your verification code.\n\nFor your security, do not share this code.');
    expect(interactive.footer!.text).toBe('This code expires in 5 minutes');
    expect(JSON.parse(interactive.nativeFlowMessage!.buttons![0].buttonParamsJson!)).toEqual({
      display_text: 'Copy Code',
      copy_code: '482910',
    });
  });

  it('omits the footer when there is none', () => {
    const msg = createOtpMessage('1', { ...DEFAULT_OTP_TEMPLATE, footer: null });
    expect(msg.documentWithCaptionMessage!.message!.interactiveMessage!.footer).toBeUndefined();
  });

  it('sends plain text without the copy button, footer as the italic last line', () => {
    const msg = createOtpMessage('1234', {
      body: 'Code {{code}} / again {{ code }}',
      footer: 'Valid 5 min',
      showCopyButton: false,
      copyButtonText: 'Copy Code',
    });
    expect(msg).toEqual({ conversation: 'Code 1234 / again 1234\n\n_Valid 5 min_' });
  });

  it('inserts codes containing "$" literally', () => {
    const msg = createOtpMessage('$&12', { ...DEFAULT_OTP_TEMPLATE, showCopyButton: false, footer: null });
    expect(msg.conversation).toBe('*$&12* is your verification code.\n\nFor your security, do not share this code.');
  });
});
