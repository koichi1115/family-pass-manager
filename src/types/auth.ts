import type { FamilyMember, Role } from '@prisma/client';

// 認証関連の型定義

export interface ClientCertificate {
  fingerprint: string;
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  isValid: boolean;
}

export interface CertificateValidationResult {
  valid: boolean;
  user?: FamilyMember;
  certificate?: ClientCertificate;
  error?: string;
}

export interface SessionData {
  sessionToken: string;
  userId: string;
  certFingerprint: string;
  expiresAt: Date;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  appVersion?: string;
  deviceId?: string;
}

export interface UserSession {
  id: string;
  user: FamilyMember;
  session: {
    id: string;
    createdAt: Date;
    lastAccessedAt: Date;
    expiresAt: Date;
  };
  permissions: string[];
}

export interface MasterPasswordVerification {
  verified: boolean;
  encryptionSalt?: string;
  keyDerivationParams?: {
    algorithm: string;
    hash: string;
    iterations: number;
    saltLength: number;
  };
}

export interface AuthenticationRequest {
  clientCert: string;
  certFingerprint: string;
  deviceInfo: DeviceInfo;
}

export interface MasterPasswordRequest {
  masterPasswordHash: string;
}

export interface AuthenticationResponse {
  success: boolean;
  sessionToken?: string;
  expiresAt?: Date;
  user?: PublicUserInfo;
  certificate?: ClientCertificate;
}

export interface PublicUserInfo {
  id: string;
  name: string;
  displayName: string;
  role: Role;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ja' | 'en';
    timezone: string;
    itemsPerPage: number;
    defaultView: 'list' | 'grid' | 'card';
  };
  notifications: {
    passwordExpiry: boolean;
    newEntries: boolean;
    securityAlerts: boolean;
    emailNotifications: boolean;
  };
  security: {
    autoLogoutMinutes: number;
    requireReasonForChanges: boolean;
    maskPasswordsInList: boolean;
  };
  misc: {
    favoriteCategories: string[];
    quickAccessPasswords: string[];
  };
}

// 権限関連
export type Permission = 
  | 'password:read'
  | 'password:write'
  | 'password:delete'
  | 'history:read'
  | 'category:read'
  | 'category:write'
  | 'admin:read'
  | 'admin:write';

export interface RolePermissions {
  [key: string]: Permission[];
}

// セッション管理
export interface SessionValidationResult {
  valid: boolean;
  user?: FamilyMember;
  session?: {
    id: string;
    createdAt: Date;
    lastAccessedAt: Date;
    expiresAt: Date;
  };
  error?: string;
}

// ログイン試行
export interface LoginAttempt {
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
}

// レート制限
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

// エラー型
export type AuthError =
  | 'CERT_MISSING'
  | 'CERT_INVALID'
  | 'CERT_EXPIRED'
  | 'SESSION_EXPIRED'
  | 'SESSION_INVALID'
  | 'MASTER_PASSWORD_REQUIRED'
  | 'MASTER_PASSWORD_INVALID'
  | 'RATE_LIMIT_EXCEEDED'
  | 'MEMBER_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'SYSTEM_ERROR';

export interface AuthErrorResponse {
  code: AuthError;
  message: string;
  details?: any;
  retryAfter?: number;
}

// ログ関連
export interface SecurityLog {
  userId?: string;
  action: string;
  result: 'success' | 'failure';
  ip: string;
  userAgent: string;
  details?: Record<string, any>;
  timestamp: Date;
}