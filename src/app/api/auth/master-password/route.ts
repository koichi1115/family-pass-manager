import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateMasterPassword, generateSessionToken, createSession, updateSession } from '@/lib/auth';
import { rateLimiter, logSecurityEvent } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || 'unknown';
    const isAllowed = await rateLimiter.checkLimit(`master_password:${clientIP}`, 5, 900); // 5回/15分
    
    if (!isAllowed) {
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        event: 'master_password_auth',
        ip: clientIP,
        timestamp: new Date(),
      });
      
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { masterPassword, rememberDevice } = body;

    if (!masterPassword) {
      return NextResponse.json(
        { error: 'Master password is required' },
        { status: 400 }
      );
    }

    // 一時トークンの検証
    const authHeader = request.headers.get('authorization');
    const tempToken = authHeader?.replace('Bearer ', '');
    
    if (!tempToken) {
      return NextResponse.json(
        { error: 'Temporary token is required' },
        { status: 401 }
      );
    }

    // セッションの取得
    const session = await prisma.session.findFirst({
      where: {
        token: tempToken,
        stage: 'certificate_validated',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        member: true,
      },
    });

    if (!session) {
      await logSecurityEvent('INVALID_TEMP_TOKEN', {
        token: tempToken.substring(0, 10) + '...',
        ip: clientIP,
        timestamp: new Date(),
      });
      
      return NextResponse.json(
        { error: 'Invalid or expired temporary token' },
        { status: 401 }
      );
    }

    // マスターパスワードの検証
    const validationResult = await validateMasterPassword(
      session.member.id,
      masterPassword
    );

    if (!validationResult.isValid) {
      // 失敗回数を記録
      await prisma.securityLog.create({
        data: {
          event: 'MASTER_PASSWORD_FAILED',
          memberId: session.member.id,
          ip: clientIP,
          userAgent: request.headers.get('user-agent') || '',
          metadata: {
            attempts: validationResult.attempts,
          },
        },
      });

      return NextResponse.json(
        { 
          error: 'Invalid master password',
          attempts: validationResult.attempts,
          lockTime: validationResult.lockTime,
        },
        { status: 401 }
      );
    }

    // 完全なセッショントークンを生成
    const sessionToken = generateSessionToken({
      memberId: session.member.id,
      certificateId: session.certificateId,
      stage: 'authenticated',
      expiresAt: new Date(Date.now() + (rememberDevice ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000)), // 30日 or 8時間
    });

    // セッションの更新
    await updateSession(session.id, {
      token: sessionToken,
      stage: 'authenticated',
      trusted: rememberDevice,
      expiresAt: new Date(Date.now() + (rememberDevice ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000)),
    });

    // 暗号化キーの生成（クライアントサイドで使用）
    const salt = session.member.encryptionSalt;
    const keyDerivationInfo = {
      salt,
      iterations: 100000,
      algorithm: 'PBKDF2',
    };

    await logSecurityEvent('AUTHENTICATION_SUCCESS', {
      memberId: session.member.id,
      certificateId: session.certificateId,
      trusted: rememberDevice,
      ip: clientIP,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      token: sessionToken,
      member: {
        id: session.member.id,
        name: session.member.name,
        email: session.member.email,
        role: session.member.role,
      },
      keyDerivation: keyDerivationInfo,
      expiresAt: new Date(Date.now() + (rememberDevice ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000)),
    });

  } catch (error) {
    console.error('Master password authentication error:', error);
    
    await logSecurityEvent('MASTER_PASSWORD_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.ip || 'unknown',
      timestamp: new Date(),
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}