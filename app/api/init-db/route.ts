import initializeDatabase from '@/lib/initialize-db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await initializeDatabase();
    return NextResponse.json(
      { success: true, message: 'Database initialized successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
