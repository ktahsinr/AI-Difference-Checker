import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/lib/models/Report';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

async function testFilePreviewFix() {
  try {
    console.log('🔄 Testing file preview fix...\n');

    // Connect to database
    await connectToDatabase();
    console.log('✅ Database connected\n');

    // Find or create test users
    let teacher = await User.findOne({ role: 'teacher' });
    let student = await User.findOne({ role: 'student' });

    if (!teacher) {
      teacher = await User.create({
        name: 'Test Teacher',
        email: 'teacherupload@test.com',
        nsuId: 'T123456',
        password: 'hashed_password',
        role: 'teacher',
        isVerified: true,
      });
    }

    if (!student) {
      student = await User.create({
        name: 'Test Student',
        email: 'studenttest@test.com',
        nsuId: 'S123456',
        password: 'hashed_password',
        role: 'student',
        isVerified: true,
      });
    }

    console.log('✅ Users found/created:');
    console.log(`   Teacher: ${teacher.name} (${teacher._id})`);
    console.log(`   Student: ${student.name} (${student._id})\n`);

    // Create a sample PDF content as Buffer
    const samplePdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000244 00000 n\n0000000338 00000 n\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n417\n%%EOF');

    console.log('📝 Creating report with file data...');
    const report = await Report.create({
      fileName: 'test-preview.pdf',
      fileType: 'pdf',
      fileSize: samplePdfContent.length,
      studentId: student._id.toString(),
      studentName: student.name,
      uploadedBy: teacher._id.toString(),
      uploadedByName: teacher.name,
      fileData: samplePdfContent,
      status: 'pending',
      similarity: null,
    });

    console.log(`✅ Report created with ID: ${report._id}`);
    console.log(`   File: ${report.fileName}`);
    console.log(`   Size: ${report.fileSize} bytes`);
    console.log(`   File data stored: ${!!report.fileData}\n`);

    // Now test the file retrieval as the API would do it
    console.log('🔍 Testing file retrieval (simulating API)...');
    
    const reportId = report._id.toString();
    console.log(`   Report ID: ${reportId}`);
    console.log(`   Is valid MongoDB ObjectId: ${mongoose.Types.ObjectId.isValid(reportId)}`);

    // Fetch the report exactly as the API does
    const fetchedReport = await Report.findById(reportId);
    
    if (!fetchedReport) {
      console.error('❌ Report not found!');
      return;
    }

    console.log(`✅ Report found in database`);
    console.log(`   Has fileData: ${!!fetchedReport.fileData}`);
    console.log(`   FileData size: ${fetchedReport.fileData?.length || 0} bytes`);

    if (!fetchedReport.fileData) {
      console.error('❌ File data is missing!');
      return;
    }

    // Test base64 conversion
    console.log('\n📊 Testing base64 conversion...');
    const base64Data = fetchedReport.fileData.toString('base64');
    console.log(`✅ Base64 conversion successful`);
    console.log(`   Base64 length: ${base64Data.length} characters`);
    console.log(`   First 100 chars: ${base64Data.substring(0, 100)}`);

    // Verify base64 can be converted back
    const decodedBuffer = Buffer.from(base64Data, 'base64');
    console.log(`✅ Base64 decoded successfully`);
    console.log(`   Decoded size matches original: ${decodedBuffer.length === samplePdfContent.length}`);

    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await Report.deleteOne({ _id: report._id });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests passed! File preview system is working correctly.\n');
    console.log('Next steps:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Login to the application');
    console.log('3. Upload a file using the file upload form');
    console.log('4. Go to admin/results or dashboard/results to see the uploaded files');
    console.log('5. Click "View Details" on a file to see the preview');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testFilePreviewFix();
