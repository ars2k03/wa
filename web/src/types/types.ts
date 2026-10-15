export type WhatsAppConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'qr_ready';

export interface User {
  id: string;
  name: string | null;
  email: string | null;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionInfo {
  sessionId: string;
  status: WhatsAppConnectionStatus;
  qr: string | null; // Base64 data URL (data:image/png;base64,...)
  qrRaw: string | null;
  phoneNumber: string | null;
  linking?: boolean; // QR scanned, device is finishing the link handshake
  qrRefreshing?: boolean; // Previous QR expired, a new one is being generated
  qrExpired?: boolean; // Auto-refresh stopped; user must request a new QR
  lastError?: string | null;
}

export interface OtpTemplateContent {
  body: string;
  footer: string | null;
  showCopyButton: boolean;
  copyButtonText: string;
}

export interface OtpTemplate extends OtpTemplateContent {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageLog {
  id: string;
  sessionId: string;
  apiKey: string | null;
  recipient: string;
  messageType: string;
  messageId: string | null;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
}

export interface SendOtpPayload {
  phoneNumber: string;
  otp: string;
}

export interface SendOtpResult {
  messageId: string;
  recipient: string;
  timestamp: number;
}
