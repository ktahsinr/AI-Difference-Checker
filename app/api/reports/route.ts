import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/lib/models/Report';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Build query based on role
    let query: any = {};

    if (role === 'student') {
      // Students see reports uploaded for them or by them
      query = {
        $or: [
          { studentId: userId }, // Reports for this student
          { uploadedBy: userId }, // Reports uploaded by this student
        ],
      };
    } else if (role === 'teacher') {
      // Teachers see all reports they uploaded
      query = { uploadedBy: userId };
    } else if (role === 'admin') {
      // Admins see all reports
      query = {};
    }

    const reports = await Report.find(query).sort({ createdAt: -1 }).lean();

    const responseData = {
      success: true,
      reports: reports.map((report) => ({
        id: report._id.toString(),
        fileName: report.fileName,
        fileType: report.fileType,
        fileSize: report.fileSize,
        uploadedBy: report.uploadedBy,
        uploadedByName: report.uploadedByName,
        studentId: report.studentId,
        studentName: report.studentName,
        status: report.status,
        similarityPercentage: report.similarityPercentage,
        // include any stored match details for client-side comparison view
        matches: report.matches || [],
        verdict: report.verdict,
        verdictBy: report.verdictBy,
        verdictByName: report.verdictByName,
        verdictAt: report.verdictAt ? new Date(report.verdictAt).toISOString() : null,
        createdAt: new Date(report.createdAt).toISOString(),
      })),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Fetch reports error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch reports';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
