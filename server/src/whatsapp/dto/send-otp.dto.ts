export class SendOtpDto {
  phoneNumber!: string;
  otp!: string;
  sessionId?: string;
}
