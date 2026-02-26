import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/lib/models/Report';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadedById = formData.get('uploadedById') as string;
    const uploadedByName = formData.get('uploadedByName') as string;
    const studentId = formData.get('studentId') as string;
    const studentName = formData.get('studentName') as string;
    const userRole = formData.get('userRole') as string;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only PDF and DOCX files are accepted' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be under 10MB' },
        { status: 400 }
      );
    }

    // Validate uploader exists
    const uploader = await User.findById(uploadedById);
    if (!uploader) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 400 }
      );
    }

    // Validate student exists if different from uploader
    if (studentId !== uploadedById) {
      const student = await User.findById(studentId);
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 400 }
        );
      }
    }

    // Determine file type
    const fileName = file.name.toLowerCase();
    const fileType = fileName.endsWith('.pdf') ? 'pdf' : 'docx';

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create report document with file data
    const newReport = new Report({
      fileName: file.name,
      fileType,
      fileSize: file.size,
      fileData: buffer,
      uploadedBy: uploadedById,
      uploadedByName,
      studentId,
      studentName,
      status: userRole === 'teacher' ? 'processing' : 'pending',
      similarityPercentage: userRole === 'teacher' ? Math.floor(Math.random() * 50) : null,
      // matches will store simulated matched segments for comparison UI
      matches: [],
      verdict: null,
      verdictBy: null,
      verdictByName: null,
      verdictAt: null,
    });

    await newReport.save();

    const responseData = {
      success: true,
      message: 'File uploaded successfully',
      report: {
        id: newReport._id.toString(),
        fileName: newReport.fileName,
        fileType: newReport.fileType,
        fileSize: newReport.fileSize,
        status: newReport.status,
        studentName: newReport.studentName,
        createdAt: newReport.createdAt.toISOString(),
      },
      // Estimate processing time (simple heuristic: ~1s per 100KB, min 5s)
      estimatedSeconds: Math.max(5, Math.ceil(newReport.fileSize / (100 * 1024))),
    };

    // If uploader is a teacher, simulate match data immediately so frontend can show comparison
    if (userRole === 'teacher') {
      const lines = [] as string[]
      // create simple placeholder lines based on file name to demo comparison
      for (let i = 1; i <= 20; i++) {
        lines.push(`Line ${i}: sample content from ${file.name}`)
      }

      const matchedIndices = [2, 5, 9, 14]
      const simulatedMatches = [
        {
          sourceName: 'Example Source A',
          leftLines: lines,
          rightLines: lines.map((l, idx) => (matchedIndices.includes(idx + 1) ? `${l} (matched)` : l)),
          leftMatches: matchedIndices,
          rightMatches: matchedIndices,
        },
      ]

      newReport.matches = simulatedMatches
      // ensure similarity is present
      if (newReport.similarityPercentage === null) newReport.similarityPercentage = Math.floor(Math.random() * 50)
      await newReport.save()
      responseData.report.similarityPercentage = newReport.similarityPercentage
      responseData.report.matches = simulatedMatches
    }
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
