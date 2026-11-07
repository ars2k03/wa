import type { BinaryNode, proto } from 'baileys';
import { CODE_PLACEHOLDER, type OtpTemplateContent } from '../../otp_template/otp_template.constants.js';

/**
 * Builds the OTP message from the user's template (or the default one).
 * With the copy button it is an interactive message whose footer and button WhatsApp renders natively;
 * without it, a plain text message with the footer as an italic last line.
 */
export function createOtpMessage(otp: string, template: OtpTemplateContent): proto.IMessage {
  const cleanOtp = otp.trim();
  // Function replacer so "$" in a code is never treated as a replacement pattern
  const text = template.body.replace(CODE_PLACEHOLDER, () => cleanOtp);

  if (!template.showCopyButton) {
    return {
      conversation: template.footer ? `${text}\n\n_${template.footer}_` : text,
    };
  }

  const content: proto.IMessage = {
    interactiveMessage: {
      body: { text },
      ...(template.footer && { footer: { text: template.footer } }),
      nativeFlowMessage: {
        buttons: [
          {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: template.copyButtonText,
              copy_code: cleanOtp,
            }),
          },
        ],
      },
    },
  };

  return { documentWithCaptionMessage: { message: content } };
}

export function otpCopyMessageNodes(): BinaryNode[] {
  return [
    {
      tag: 'biz',
      attrs: {},
      content: [
        {
          tag: 'interactive',
          attrs: { type: 'native_flow', v: '1' },
          content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }],
        },
      ],
    }
  ];
}
