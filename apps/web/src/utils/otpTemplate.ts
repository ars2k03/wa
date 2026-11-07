import type { OtpTemplateContent } from '@/types/types';

// Mirrors apps/server/src/otp_template/otp_template.constants.ts and the checks in
// otp_template.service.ts, so the editor flags problems before the server does.

const CODE_PLACEHOLDER = /\{\{\s*code\s*\}\}/g;
const ANY_PLACEHOLDER = /\{\{\s*([^{}]*?)\s*\}\}/g;

export const OTP_TEMPLATE_LIMITS = {
  body: 1024,
  footer: 60,
  copyButtonText: 20,
} as const;

export const DEFAULT_OTP_TEMPLATE: OtpTemplateContent = {
  body: '*{{code}}* is your verification code.\n\nFor your security, do not share this code.',
  footer: 'This code expires in 5 minutes',
  showCopyButton: true,
  copyButtonText: 'Copy Code',
};

/** Puts the code into every {{code}} placeholder */
export function renderOtpBody(body: string, code: string): string {
  return body.replace(CODE_PLACEHOLDER, () => code);
}

/** Returns the first problem with the template, or null when it can be saved */
export function validateOtpTemplate(t: OtpTemplateContent): string | null {
  const body = t.body.trim();
  if (!body) return 'The message cannot be empty.';
  if (body.length > OTP_TEMPLATE_LIMITS.body) {
    return `The message must be at most ${OTP_TEMPLATE_LIMITS.body} characters.`;
  }
  const others = [...new Set([...body.matchAll(ANY_PLACEHOLDER)].map((m) => m[1]).filter((n) => n !== 'code'))];
  if (others.length > 0) {
    return `Only {{code}} can be used. Remove: ${others.map((n) => `{{${n}}}`).join(', ')}`;
  }
  if (!new RegExp(CODE_PLACEHOLDER.source).test(body)) {
    return 'The message must include {{code}} where the OTP should appear.';
  }
  const footer = t.footer?.trim() ?? '';
  if (footer.length > OTP_TEMPLATE_LIMITS.footer) {
    return `The footer must be at most ${OTP_TEMPLATE_LIMITS.footer} characters.`;
  }
  if (new RegExp(ANY_PLACEHOLDER.source).test(footer)) {
    return 'The footer cannot contain placeholders like {{code}}.';
  }
  if (t.showCopyButton && t.copyButtonText.trim().length > OTP_TEMPLATE_LIMITS.copyButtonText) {
    return `The button text must be at most ${OTP_TEMPLATE_LIMITS.copyButtonText} characters.`;
  }
  return null;
}
