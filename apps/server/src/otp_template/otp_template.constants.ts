// Keep in sync with apps/web/src/utils/otpTemplate.ts (editor validation and preview).

/** The only placeholder allowed in an OTP template, e.g. {{code}} or {{ code }} */
export const CODE_PLACEHOLDER = /\{\{\s*code\s*\}\}/g;
/** Any {{placeholder}}, used to reject everything except {{code}} */
export const ANY_PLACEHOLDER = /\{\{\s*([^{}]*?)\s*\}\}/g;

// WhatsApp limits: footer 60 characters, button label 20 characters.
export const OTP_TEMPLATE_LIMITS = {
  body: 1024,
  footer: 60,
  copyButtonText: 20,
} as const;

export interface OtpTemplateContent {
  body: string;
  footer: string | null;
  showCopyButton: boolean;
  copyButtonText: string;
}

/** Sent when the user has no custom template */
export const DEFAULT_OTP_TEMPLATE: OtpTemplateContent = {
  body: '*{{code}}* is your verification code.\n\nFor your security, do not share this code.',
  footer: 'This code expires in 5 minutes',
  showCopyButton: true,
  copyButtonText: 'Copy Code',
};
