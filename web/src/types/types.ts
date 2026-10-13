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
  sessionId: string | null;
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
  sessionId?: string;
}

export interface SendOtpResult {
  messageId: string;
  recipient: string;
  timestamp: number;
}

export interface BackendStats {
  activeKeys: number;
  registeredUsers: number;
  dispatchedMessages: number;
}
