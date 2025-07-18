import { testConnection } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const connected = await testConnection();
    
    if (connected) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database connection successful',
        database: 'audiosphere'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Database connection failed' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Database connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}