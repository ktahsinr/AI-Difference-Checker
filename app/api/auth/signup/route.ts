import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { name, email, password, role, nsuId, department } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !role || !nsuId || !department) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if NSU ID already exists
    const existingNsuId = await User.findOne({ nsuId });
    if (existingNsuId) {
      return NextResponse.json(
        { success: false, error: 'An account with this NSU ID already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      nsuId,
      department,
      verified: role === 'student', // Auto-verify students, teachers need admin approval
    });

    await newUser.save();

    // Return success with appropriate message
    const responseData = {
      success: true,
      message:
        role === 'teacher'
          ? 'Account created. Awaiting admin approval before you can log in.'
          : 'Account created successfully',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        nsuId: newUser.nsuId,
        department: newUser.department,
        verified: newUser.verified,
        createdAt: newUser.createdAt.toISOString(),
      },
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create account';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
