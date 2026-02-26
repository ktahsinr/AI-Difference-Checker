import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all students
    const students = await User.find({ role: 'student' }).select('_id name nsuId');

    const responseData = {
      success: true,
      students: students.map((student) => ({
        id: student._id.toString(),
        name: student.name,
        nsuId: student.nsuId,
      })),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Fetch students error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch students';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
