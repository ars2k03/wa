import type {
  ApiKey,
  ApiResponse,
  BackendStats,
  MessageLog,
  SendOtpPayload,
  SendOtpResult,
  SessionInfo,
  User,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

async function fetchJson<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Auto-inject stored token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('telegraph_auth_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: text };
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      `HTTP Error ${response.status}: ${response.statusText}`;
    const error: any = new Error(
      Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
    );
    error.status = response.status;
    error.data = data;
    error.isVerified = data?.isVerified;
    throw error;
  }

  return data as T;
}

export const api = {
  // Backend Health & Stats
  getStatus: async () => {
    return fetchJson<ApiResponse<any>>('/');
  },

  getStats: async (): Promise<ApiResponse<BackendStats>> => {
    return fetchJson<ApiResponse<BackendStats>>('/stats');
  },

  // Authentication
  register: async (payload: {
    name?: string;
    email: string;
    password?: string;
  }): Promise<ApiResponse<{ email: string; isVerified: boolean }>> => {
    return fetchJson<ApiResponse<{ email: string; isVerified: boolean }>>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  login: async (payload: {
    email: string;
    password?: string;
  }): Promise<ApiResponse<{ user: User; token: string; isVerified?: boolean }>> => {
    return fetchJson<ApiResponse<{ user: User; token: string; isVerified?: boolean }>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  getMe: async (): Promise<ApiResponse<User | null>> => {
    return fetchJson<ApiResponse<User | null>>('/auth/me');
  },

  // OTP Verification
  verifyOtp: async (payload: {
    email: string;
    otp: string;
  }): Promise<ApiResponse<any>> => {
    return fetchJson<ApiResponse<any>>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  resendOtp: async (payload: { email: string }): Promise<ApiResponse<any>> => {
    return fetchJson<ApiResponse<any>>('/otp/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // API Key Management
  createApiKey: async (payload: {
    userId: string;
    name?: string;
    sessionId?: string;
  }): Promise<ApiResponse<ApiKey>> => {
    return fetchJson<ApiResponse<ApiKey>>('/api-keys', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getUserApiKeys: async (userId: string): Promise<ApiResponse<ApiKey[]>> => {
    return fetchJson<ApiResponse<ApiKey[]>>(`/api-keys/${userId}`);
  },

  linkSessionToKey: async (
    keyId: string,
    sessionId: string,
  ): Promise<ApiResponse<ApiKey>> => {
    return fetchJson<ApiResponse<ApiKey>>(`/api-keys/${keyId}/link-session`, {
      method: 'PUT',
      body: JSON.stringify({ sessionId }),
    });
  },

  revokeApiKey: async (keyId: string): Promise<ApiResponse<ApiKey>> => {
    return fetchJson<ApiResponse<ApiKey>>(`/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  },

  // WhatsApp Sessions
  getAllSessions: async (): Promise<ApiResponse<SessionInfo[]>> => {
    return fetchJson<ApiResponse<SessionInfo[]>>('/sessions');
  },

  initSession: async (
    sessionId: string,
    userId?: string,
  ): Promise<ApiResponse<SessionInfo>> => {
    return fetchJson<ApiResponse<SessionInfo>>(`/sessions/${sessionId}/init`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  getSessionStatus: async (
    sessionId: string,
  ): Promise<ApiResponse<SessionInfo>> => {
    return fetchJson<ApiResponse<SessionInfo>>(`/sessions/${sessionId}/status`);
  },

  requestPairingCode: async (
    sessionId: string,
    phoneNumber: string,
  ): Promise<ApiResponse<{ sessionId: string; pairingCode: string }>> => {
    return fetchJson<
      ApiResponse<{ sessionId: string; pairingCode: string }>
    >(`/sessions/${sessionId}/pairing-code`, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  },

  deleteSession: async (sessionId: string): Promise<ApiResponse<void>> => {
    return fetchJson<ApiResponse<void>>(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  // WhatsApp Dispatch / Send OTP
  sendOtp: async (
    apiKey: string,
    payload: SendOtpPayload,
  ): Promise<ApiResponse<SendOtpResult>> => {
    return fetchJson<ApiResponse<SendOtpResult>>('/send-otp', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });
  },

  // Message Logs
  getMessageLogs: async (
    sessionId?: string,
  ): Promise<ApiResponse<MessageLog[]>> => {
    const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    return fetchJson<ApiResponse<MessageLog[]>>(`/message-logs${query}`);
  },
};
