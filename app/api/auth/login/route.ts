import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified (especially for teachers)
    if (!user.verified && user.role === 'teacher') {
      return NextResponse.json(
        {
          success: false,
          error: 'Your account is pending admin approval',
        },
        { status: 403 }
      );
    }

    // Return user data without password
    const responseData = {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        nsuId: user.nsuId,
        department: user.department,
        verified: user.verified,
        createdAt: user.createdAt.toISOString(),
      },
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Failed to log in';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
