export interface JwtPayload {
  sub: string;
  email?: string | null;
  name?: string | null;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  name: string | null;
}
