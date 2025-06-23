import { X509Certificate } from 'crypto';
import { prisma } from './db';
import { generateSessionToken, generateCertificateHash, secureCompare } from './crypto';
import type {
  CertificateValidationResult,
  SessionData,
  SessionValidationResult,
  DeviceInfo,
  RateLimitResult,
  Permission,
  RolePermissions,
} from '@/types/auth';
import type { FamilyMember, Role } from '@prisma/client';

// 役割ごとの権限定義
const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'password:read',
    'password:write',
    'password:delete',
    'history:read',
    'category:read',
    'category:write',
    'admin:read',
    'admin:write',
  ],
  father: [
    'password:read',
    'password:write',
    'password:delete',
    'history:read',
    'category:read',
  ],
  mother: [
    'password:read',
    'password:write',
    'password:delete',
    'history:read',
    'category:read',
  ],
  son: [
    'password:read',
    'password:write',
    'history:read',
    'category:read',
  ],
  daughter: [
    'password:read',
    'password:write',
    'history:read',
    'category:read',
  ],
};

// クライアント証明書の検証
export async function validateClientCertificate(
  certData: string,
  fingerprint: string
): Promise<CertificateValidationResult> {
  try {
    // Base64デコード
    const certBuffer = Buffer.from(certData, 'base64');
    const x509 = new X509Certificate(certBuffer);
    
    // 基本検証
    const now = new Date();
    const validFrom = new Date(x509.validFrom);
    const validTo = new Date(x509.validTo);
    
    if (validTo < now || validFrom > now) {
      return { valid: false, error: 'certificate_expired' };
    }
    
    // フィンガープリント検証
    const actualFingerprint = x509.fingerprint256.replace(/:/g, '').toLowerCase();
    const expectedFingerprint = fingerprint.replace(/:/g, '').toLowerCase();
    
    if (!secureCompare(actualFingerprint, expectedFingerprint)) {
      return { valid: false, error: 'fingerprint_mismatch' };
    }
    
    // データベースでユーザー検索
    const certHash = generateCertificateHash(certData);
    const user = await prisma.familyMember.findUnique({
      where: { certHash },
    });
    
    if (!user || !user.isActive) {
      return { valid: false, error: 'user_not_found' };
    }
    
    // 証明書有効期限チェック
    if (user.certExpiresAt && user.certExpiresAt < now) {
      return { valid: false, error: 'certificate_expired' };
    }
    
    return {
      valid: true,
      user,
      certificate: {
        fingerprint: actualFingerprint,
        serialNumber: x509.serialNumber,
        subject: x509.subject,
        issuer: x509.issuer,
        validFrom,
        validTo,
        isValid: true,
      },
    };
  } catch (error) {
    console.error('Certificate validation error:', error);
    return { valid: false, error: 'certificate_parse_error' };
  }
}

// セッション作成
export async function createSession(data: {
  userId: string;
  certFingerprint: string;
  deviceInfo?: DeviceInfo;
  ipAddress?: string;
}): Promise<SessionData> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間
  
  const session = await prisma.userSession.create({
    data: {
      userId: data.userId,
      sessionToken,
      certFingerprint: data.certFingerprint,
      deviceInfo: data.deviceInfo || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.deviceInfo?.userAgent || null,
      expiresAt,
      isActive: true,
    },
  });
  
  // ログイン回数を更新
  await prisma.familyMember.update({
    where: { id: data.userId },
    data: {
      lastLoginAt: new Date(),
      loginCount: { increment: 1 },
    },
  });
  
  return {
    sessionToken,
    userId: data.userId,
    certFingerprint: data.certFingerprint,
    expiresAt,
    deviceInfo: data.deviceInfo,
  };
}

// セッション検証
export async function validateSession(
  sessionToken: string,
  certFingerprint: string
): Promise<SessionValidationResult> {
  try {
    const session = await prisma.userSession.findFirst({
      where: {
        sessionToken,
        certFingerprint,
        expiresAt: { gt: new Date() },
        isActive: true,
      },
      include: {
        user: true,
      },
    });
    
    if (!session) {
      return { valid: false, error: 'session_invalid' };
    }
    
    if (!session.user.isActive) {
      return { valid: false, error: 'user_inactive' };
    }
    
    // セッションのアクセス時刻を更新
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastAccessedAt: new Date() },
    });
    
    return {
      valid: true,
      user: session.user,
      session: {
        id: session.id,
        createdAt: session.createdAt,
        lastAccessedAt: new Date(),
        expiresAt: session.expiresAt,
      },
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, error: 'system_error' };
  }
}

// セッション無効化
export async function invalidateSession(sessionToken: string): Promise<boolean> {
  try {
    await prisma.userSession.updateMany({
      where: { sessionToken },
      data: { isActive: false },
    });
    return true;
  } catch (error) {
    console.error('Session invalidation error:', error);
    return false;
  }
}

// 期限切れセッションのクリーンアップ
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.userSession.updateMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false },
        ],
      },
      data: { isActive: false },
    });
    return result.count;
  } catch (error) {
    console.error('Session cleanup error:', error);
    return 0;
  }
}

// ユーザーの権限取得
export function getUserPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// 権限チェック
export function hasPermission(userRole: Role, requiredPermission: Permission): boolean {
  const permissions = getUserPermissions(userRole);
  return permissions.includes(requiredPermission);
}

// レート制限チェック（簡易実装）
const rateLimitStore = new Map<string, { count: number; resetTime: Date }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15分
): RateLimitResult {
  const now = new Date();
  const key = identifier;
  
  let record = rateLimitStore.get(key);
  
  // レコードが存在しないか、ウィンドウ期間外の場合は新規作成
  if (!record || record.resetTime <= now) {
    record = { count: 0, resetTime: new Date(now.getTime() + windowMs) };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  
  const allowed = record.count <= limit;
  const remaining = Math.max(0, limit - record.count);
  
  return {
    allowed,
    limit,
    remaining,
    reset: record.resetTime,
    retryAfter: allowed ? undefined : Math.ceil((record.resetTime.getTime() - now.getTime()) / 1000),
  };
}

// セキュリティログ記録
export async function logSecurityEvent(data: {
  userId?: string;
  action: string;
  result: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}): Promise<void> {
  try {
    await prisma.systemLog.create({
      data: {
        userId: data.userId || null,
        logLevel: data.result === 'success' ? 'info' : 'warn',
        eventType: 'security_event',
        message: `${data.action}: ${data.result}`,
        details: {
          action: data.action,
          result: data.result,
          ip: data.ipAddress,
          userAgent: data.userAgent,
          ...data.details,
        },
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// マスターパスワード設定チェック
export async function hasMasterPasswordSet(userId: string): Promise<boolean> {
  try {
    // 実際の実装では、ユーザーがマスターパスワードを設定済みかどうかをチェック
    // ここでは簡易的にユーザーの存在をチェック
    const user = await prisma.familyMember.findUnique({
      where: { id: userId },
    });
    
    return user?.isActive === true;
  } catch (error) {
    console.error('Master password check error:', error);
    return false;
  }
}

// ユーザーのアクティブセッション数取得
export async function getActiveSessionCount(userId: string): Promise<number> {
  try {
    const count = await prisma.userSession.count({
      where: {
        userId,
        expiresAt: { gt: new Date() },
        isActive: true,
      },
    });
    return count;
  } catch (error) {
    console.error('Active session count error:', error);
    return 0;
  }
}

// 他のデバイスのセッションを無効化
export async function invalidateOtherSessions(
  userId: string,
  currentSessionToken: string
): Promise<number> {
  try {
    const result = await prisma.userSession.updateMany({
      where: {
        userId,
        sessionToken: { not: currentSessionToken },
        isActive: true,
      },
      data: { isActive: false },
    });
    return result.count;
  } catch (error) {
    console.error('Session invalidation error:', error);
    return 0;
  }
}