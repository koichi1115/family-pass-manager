import { NextRequest, NextResponse } from 'next/server';
import { validateClientCertificate, createSession, validateSession, invalidateSession, checkRateLimit, logSecurityEvent } from '@/lib/auth';
import type { AuthenticationRequest } from '@/types/auth';

// クライアントIPアドレスの取得
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

// User-Agentの取得
function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

// 成功レスポンス
function successResponse(data: any, status: number = 200) {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
  }, { status });
}

// エラーレスポンス
function errorResponse(code: string, message: string, status: number = 400, details?: any) {
  return NextResponse.json({
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
  }, { status });
}

// POST /api/auth/session - セッション作成（ログイン）
export async function POST(request: NextRequest) {
  const ipAddress = getClientIP(request);
  const userAgent = getUserAgent(request);
  
  try {
    // レート制限チェック
    const rateLimit = checkRateLimit(`auth_${ipAddress}`, 5, 15 * 60 * 1000); // 15分間に5回
    
    if (!rateLimit.allowed) {
      await logSecurityEvent({
        action: 'session_create',
        result: 'failure',
        ipAddress,
        userAgent,
        details: { reason: 'rate_limit_exceeded' },
      });
      
      return errorResponse(
        'AUTH_RATE_LIMIT_EXCEEDED',
        '認証試行回数の上限に達しました。しばらく待ってから再試行してください。',
        429,
        { retryAfter: rateLimit.retryAfter }
      );
    }
    
    // クライアント証明書の取得
    const clientCert = request.headers.get('x-client-cert');
    const certFingerprint = request.headers.get('x-client-cert-fingerprint');
    
    if (!clientCert || !certFingerprint) {
      await logSecurityEvent({
        action: 'session_create',
        result: 'failure',
        ipAddress,
        userAgent,
        details: { reason: 'missing_certificate' },
      });
      
      return errorResponse(
        'AUTH_CERT_MISSING',
        'クライアント証明書が必要です',
        401
      );
    }
    
    // リクエストボディの解析
    let deviceInfo;
    try {
      const body = await request.json();
      deviceInfo = body.deviceInfo;
    } catch (error) {
      deviceInfo = {
        userAgent,
        platform: 'unknown',
      };
    }
    
    // 証明書検証
    const certValidation = await validateClientCertificate(clientCert, certFingerprint);
    
    if (!certValidation.valid) {
      await logSecurityEvent({
        action: 'session_create',
        result: 'failure',
        ipAddress,
        userAgent,
        details: { 
          reason: 'invalid_certificate',
          error: certValidation.error 
        },
      });
      
      return errorResponse(
        'AUTH_CERT_INVALID',
        'クライアント証明書が無効です',
        401
      );
    }
    
    if (!certValidation.user) {
      await logSecurityEvent({
        action: 'session_create',
        result: 'failure',
        ipAddress,
        userAgent,
        details: { reason: 'user_not_found' },
      });
      
      return errorResponse(
        'AUTH_CERT_INVALID',
        'このクライアント証明書に関連付けられたユーザーが見つかりません',
        401
      );
    }
    
    // セッション作成
    const sessionData = await createSession({
      userId: certValidation.user.id,
      certFingerprint,
      deviceInfo,
      ipAddress,
    });
    
    // 成功ログ
    await logSecurityEvent({
      userId: certValidation.user.id,
      action: 'session_create',
      result: 'success',
      ipAddress,
      userAgent,
      details: {
        sessionToken: sessionData.sessionToken,
        deviceInfo,
      },
    });
    
    return successResponse({
      sessionToken: sessionData.sessionToken,
      expiresAt: sessionData.expiresAt,
      user: {
        id: certValidation.user.id,
        name: certValidation.user.name,
        displayName: certValidation.user.displayName,
        role: certValidation.user.role,
        preferences: certValidation.user.preferences,
      },
      certificate: certValidation.certificate,
    }, 200);
    
  } catch (error) {
    console.error('Session creation error:', error);
    
    await logSecurityEvent({
      action: 'session_create',
      result: 'failure',
      ipAddress,
      userAgent,
      details: { 
        reason: 'system_error',
        error: error instanceof Error ? error.message : 'unknown_error'
      },
    });
    
    return errorResponse(
      'SYSTEM_ERROR',
      'システムエラーが発生しました',
      500
    );
  }
}

// GET /api/auth/session - セッション検証
export async function GET(request: NextRequest) {
  const ipAddress = getClientIP(request);
  const userAgent = getUserAgent(request);
  
  try {
    // Authorizationヘッダーからセッショントークンを取得
    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return errorResponse(
        'AUTH_SESSION_MISSING',
        'セッショントークンが必要です',
        401
      );
    }
    
    // クライアント証明書の取得
    const certFingerprint = request.headers.get('x-client-cert-fingerprint');
    
    if (!certFingerprint) {
      return errorResponse(
        'AUTH_CERT_MISSING',
        'クライアント証明書のフィンガープリントが必要です',
        401
      );
    }
    
    // セッション検証
    const sessionValidation = await validateSession(sessionToken, certFingerprint);
    
    if (!sessionValidation.valid) {
      await logSecurityEvent({
        action: 'session_validate',
        result: 'failure',
        ipAddress,
        userAgent,
        details: { 
          reason: sessionValidation.error,
          sessionToken: sessionToken.substring(0, 8) + '...'
        },
      });
      
      return errorResponse(
        'AUTH_SESSION_INVALID',
        'セッションが無効です',
        401
      );
    }
    
    return successResponse({
      user: {
        id: sessionValidation.user!.id,
        name: sessionValidation.user!.name,
        displayName: sessionValidation.user!.displayName,
        role: sessionValidation.user!.role,
        preferences: sessionValidation.user!.preferences,
      },
      session: sessionValidation.session,
      permissions: [], // TODO: 実際の権限を取得
    });
    
  } catch (error) {
    console.error('Session validation error:', error);
    
    return errorResponse(
      'SYSTEM_ERROR',
      'システムエラーが発生しました',
      500
    );
  }
}

// DELETE /api/auth/session - ログアウト
export async function DELETE(request: NextRequest) {
  const ipAddress = getClientIP(request);
  const userAgent = getUserAgent(request);
  
  try {
    // Authorizationヘッダーからセッショントークンを取得
    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return errorResponse(
        'AUTH_SESSION_MISSING',
        'セッショントークンが必要です',
        401
      );
    }
    
    // セッションを無効化
    const success = await invalidateSession(sessionToken);
    
    if (success) {
      await logSecurityEvent({
        action: 'session_destroy',
        result: 'success',
        ipAddress,
        userAgent,
        details: { sessionToken: sessionToken.substring(0, 8) + '...' },
      });
      
      return new NextResponse(null, { status: 204 });
    } else {
      return errorResponse(
        'AUTH_SESSION_INVALID',
        'セッションが見つかりません',
        404
      );
    }
    
  } catch (error) {
    console.error('Session destruction error:', error);
    
    return errorResponse(
      'SYSTEM_ERROR',
      'システムエラーが発生しました',
      500
    );
  }
}