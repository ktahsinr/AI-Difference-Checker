import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/lib/models/Report';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // Handle params as Promise (Next.js 15+)
    const { id } = await params;
    const { verdict, status, verdictBy, verdictByName, verdictAt } = await request.json();

    // Validate report exists
    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Update report
    report.verdict = verdict;
    report.status = status;
    report.verdictBy = verdictBy;
    report.verdictByName = verdictByName;
    report.verdictAt = verdictAt ? new Date(verdictAt) : null;

    await report.save();

    const responseData = {
      success: true,
      message: 'Report updated successfully',
      report: {
        id: report._id.toString(),
        verdict: report.verdict,
        status: report.status,
        verdictByName: report.verdictByName,
      },
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update report error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update report';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
