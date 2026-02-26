import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/lib/models/Report';
import User from '@/lib/models/User';
import * as fs from 'fs';
import * as path from 'path';

async function testFullFileUpload() {
  try {
    console.log('🔄 Testing FULL FILE UPLOAD to MongoDB...\n');

    // Connect to database
    await connectToDatabase();
    console.log('✅ Database connected\n');

    // Get test users
    const teacher = await User.findOne({ role: 'teacher' });
    const student = await User.findOne({ role: 'student' });

    if (!teacher || !student) {
      console.error('❌ Test users not found');
      return;
    }

    console.log('📝 Creating test PDF file...');
    
    // Create a realistic PDF file in memory (about 50KB of content)
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 2000 >>
stream
BT
/F1 12 Tf
100 700 Td
(Sample PDF Document) Tj
0 -20 Td
(This is a test document to verify that entire file contents are stored in MongoDB.) Tj
0 -20 Td
(File upload test - checking if full file binary is preserved.) Tj
ET
stream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000244 00000 n
0000002294 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
2372
%%EOF`;

    // Repeat content to make file larger (simulate real PDF)
    const largePdfContent = pdfContent + '\n' + pdfContent.repeat(20);
    const fileBuffer = Buffer.from(largePdfContent);

    console.log(`   ✅ PDF file created in memory`);
    console.log(`   File size: ${fileBuffer.length} bytes (~${(fileBuffer.length / 1024).toFixed(2)} KB)\n`);

    // Create report with full file data (simulating what the API does)
    console.log('📤 Uploading file to MongoDB...');
    const report = await Report.create({
      fileName: 'test-large-document.pdf',
      fileType: 'pdf',
      fileSize: fileBuffer.length,
      fileData: fileBuffer, // ENTIRE FILE STORED HERE
      uploadedBy: teacher._id.toString(),
      uploadedByName: teacher.name,
      studentId: student._id.toString(),
      studentName: student.name,
      status: 'processing',
      similarityPercentage: null,
    });

    console.log(`✅ Report saved to MongoDB`);
    console.log(`   Report ID: ${report._id}`);
    console.log(`   File name: ${report.fileName}`);
    console.log(`   File size: ${report.fileSize} bytes\n`);

    // Now retrieve it and verify ALL data is intact
    console.log('🔍 Retrieving file from MongoDB...');
    const retrievedReport = await Report.findById(report._id);

    if (!retrievedReport) {
      console.error('❌ Report not found in database!');
      return;
    }

    console.log('✅ Report retrieved from MongoDB');
    console.log(`   File data present: ${!!retrievedReport.fileData}`);
    console.log(`   Original size: ${fileBuffer.length} bytes`);
    console.log(`   Retrieved size: ${retrievedReport.fileData?.length || 0} bytes`);

    // Verify data integrity
    const isExactMatch = Buffer.compare(fileBuffer, retrievedReport.fileData!) === 0;
    console.log(`   Data integrity: ${isExactMatch ? '✅ PERFECT MATCH' : '❌ MISMATCH'}\n`);

    if (!isExactMatch) {
      console.error('❌ File data does not match!');
      console.error('Original first 100 bytes:', fileBuffer.slice(0, 100).toString());
      console.error('Retrieved first 100 bytes:', retrievedReport.fileData?.slice(0, 100).toString());
      return;
    }

    // Show the file can be converted to base64 for transmission
    console.log('📊 Testing base64 conversion for API transmission...');
    const base64Data = retrievedReport.fileData!.toString('base64');
    console.log(`   Base64 length: ${base64Data.length} characters`);
    console.log(`   Can be decoded back: ${Buffer.from(base64Data, 'base64').length === fileBuffer.length ? '✅ YES' : '❌ NO'}\n`);

    // Clean up
    console.log('🧹 Cleaning up test data...');
    await Report.deleteOne({ _id: report._id });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 SUCCESS! Complete file upload is working!\n');
    console.log('Summary:');
    console.log(`  ✅ File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
    console.log('  ✅ Entire file stored in MongoDB');
    console.log('  ✅ File data retrieved completely');
    console.log('  ✅ Data integrity verified');
    console.log('  ✅ Ready for preview/download\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  }
}

testFullFileUpload();
