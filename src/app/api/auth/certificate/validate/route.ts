import { NextRequest, NextResponse } from 'next/server';
import { validateClientCertificate, generateSessionToken, createSession } from '@/lib/auth';
import { rateLimiter } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || 'unknown';
    const isAllowed = await rateLimiter.checkLimit(`cert_validation:${clientIP}`, 5, 900); // 5回/15分
    
    if (!isAllowed) {
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        event: 'certificate_validation',
        ip: clientIP,
        timestamp: new Date(),
      });
      
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { certificateId } = body;

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    // クライアント証明書の取得と検証
    const clientCert = request.headers.get('x-client-cert');
    if (!clientCert) {
      await logSecurityEvent('CERTIFICATE_MISSING', {
        certificateId,
        ip: clientIP,
        timestamp: new Date(),
      });
      
      return NextResponse.json(
        { error: 'Client certificate not provided' },
        { status: 401 }
      );
    }

    // 証明書の検証
    const validationResult = await validateClientCertificate(clientCert, certificateId);
    
    if (!validationResult.isValid) {
      await logSecurityEvent('CERTIFICATE_VALIDATION_FAILED', {
        certificateId,
        reason: validationResult.error,
        ip: clientIP,
        timestamp: new Date(),
      });
      
      return NextResponse.json(
        { error: 'Certificate validation failed' },
        { status: 401 }
      );
    }

    // 一時的なセッショントークンを生成（マスターパスワード認証前）
    const tempToken = generateSessionToken({
      certificateId,
      stage: 'certificate_validated',
      memberId: validationResult.memberId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10分間有効
    });

    // 一時セッションの作成
    await createSession({
      token: tempToken,
      memberId: validationResult.memberId,
      certificateId,
      stage: 'certificate_validated',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || '',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await logSecurityEvent('CERTIFICATE_VALIDATION_SUCCESS', {
      certificateId,
      memberId: validationResult.memberId,
      ip: clientIP,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      tempToken,
      member: {
        id: validationResult.memberId,
        name: validationResult.memberName,
        role: validationResult.role,
      },
    });

  } catch (error) {
    console.error('Certificate validation error:', error);
    
    await logSecurityEvent('CERTIFICATE_VALIDATION_ERROR', {
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