import type { BinaryNode, proto } from 'baileys';

export function createOtpCopyMessage(otp: string): proto.IMessage {
  const cleanOtp = otp.trim();

  const content: proto.IMessage = {
    interactiveMessage: {
      body: {
        text: `*${cleanOtp}* is your verification code.\n\nFor your security, do not share this code.`,
      },
      footer: { text: 'This code expires in 5 minutes' },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: 'Copy Code',
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
