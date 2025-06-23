import { NextRequest, NextResponse } from 'next/server';
import { validateSession, logSecurityEvent } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // セッション検証
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // セッションの取得と検証
    const session = await prisma.session.findFirst({
      where: {
        token,
        stage: 'authenticated',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        member: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const memberId = session.member.id;
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 統計情報の集計
    const [
      totalPasswords,
      recentlyAdded,
      weakPasswords,
      duplicatePasswords,
    ] = await Promise.all([
      // 総パスワード数（家族全体）
      prisma.password.count({
        where: {
          member: {
            familyId: session.member.familyId,
          },
        },
      }),
      
      // 今月追加されたパスワード数
      prisma.password.count({
        where: {
          member: {
            familyId: session.member.familyId,
          },
          createdAt: {
            gte: thisMonth,
          },
        },
      }),
      
      // 脆弱なパスワード数（メタデータで管理）
      prisma.password.count({
        where: {
          member: {
            familyId: session.member.familyId,
          },
          metadata: {
            path: ['strength'],
            equals: 'weak',
          },
        },
      }),
      
      // 重複パスワード数の計算（簡易版）
      prisma.password.groupBy({
        by: ['encryptedPassword'],
        where: {
          member: {
            familyId: session.member.familyId,
          },
        },
        _count: true,
        having: {
          encryptedPassword: {
            _count: {
              gt: 1,
            },
          },
        },
      }).then(groups => 
        groups.reduce((total, group) => total + group._count - 1, 0)
      ),
    ]);

    // セキュリティログ
    await logSecurityEvent('DASHBOARD_STATS_ACCESS', {
      memberId: session.member.id,
      ip: request.ip || 'unknown',
      timestamp: new Date(),
    });

    return NextResponse.json({
      totalPasswords,
      recentlyAdded,
      weakPasswords,
      duplicatePasswords,
      lastUpdated: new Date(),
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    await logSecurityEvent('DASHBOARD_STATS_ERROR', {
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