import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/lib/models/Report';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // Handle params as Promise (Next.js 15+)
    const { id } = await params;

    console.log('Fetching file for report ID:', id);

    // Validate if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid MongoDB ObjectId:', id);
      return NextResponse.json(
        { success: false, error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    // Find the report
    const report = await Report.findById(id);
    console.log('Report found:', !!report);
    
    if (!report) {
      console.error('Report not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if file data exists
    if (!report.fileData) {
      console.error('File data not available for report:', id);
      return NextResponse.json(
        { success: false, error: 'File data not available' },
        { status: 404 }
      );
    }

    // Return file as base64 for preview
    const base64Data = report.fileData.toString('base64');
    const mimeType = report.fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    console.log('Successfully retrieved file:', report.fileName);

    return NextResponse.json({
      success: true,
      fileType: report.fileType,
      fileName: report.fileName,
      fileData: base64Data,
      mimeType,
    });
  } catch (error) {
    console.error('File retrieve error:', error);
    const message = error instanceof Error ? error.message : 'Failed to retrieve file';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
