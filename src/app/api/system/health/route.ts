import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

// GET /api/system/health - ヘルスチェック
export async function GET() {
  try {
    // データベース接続チェック
    const dbHealthy = await checkDatabaseConnection();
    
    // システム情報
    const systemInfo = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        database: dbHealthy ? 'ok' : 'error',
        server: 'ok',
      },
    };
    
    const status = dbHealthy ? 200 : 503;
    
    return NextResponse.json(systemInfo, { 
      status,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: 'error',
        server: 'error',
      },
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}