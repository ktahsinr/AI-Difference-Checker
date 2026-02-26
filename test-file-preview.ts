import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/lib/models/Report';
import User from '@/lib/models/User';

async function testFilePreview() {
  try {
    await connectToDatabase();

    console.log('🔄 Testing file preview functionality...\n');

    // Get a teacher and student
    const teacher = await User.findOne({ role: 'teacher' });
    const student = await User.findOne({ role: 'student' });

    if (!teacher || !student) {
      console.error('❌ Teacher or student not found');
      return;
    }

    console.log('✅ Found users:');
    console.log('   Teacher:', teacher.name);
    console.log('   Student:', student.name, '\n');

    // Create a sample report with file data
    console.log('📝 Creating sample report with file data...');

    // Create sample PDF content (minimal PDF structure)
    const pdfContent = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< >>
stream
BT
/F1 12 Tf
100 700 Td
(Sample PDF for plagiarism checking system) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000203 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
287
%%EOF`);

    const newReport = new Report({
      fileName: 'Sample_Document.pdf',
      fileType: 'pdf',
      fileSize: pdfContent.length,
      fileData: pdfContent,
      uploadedBy: teacher._id.toString(),
      uploadedByName: teacher.name,
      studentId: student._id.toString(),
      studentName: student.name,
      status: 'processing',
      similarityPercentage: 22,
      verdict: null,
      verdictBy: null,
      verdictByName: null,
      verdictAt: null,
    });

    const savedReport = await newReport.save();
    console.log('✅ Report created with ID:', savedReport._id.toString());
    console.log('   File size:', pdfContent.length, 'bytes');
    console.log('   File type:', savedReport.fileType, '\n');

    // Verify file data was saved
    console.log('🔍 Verifying file data in database...');
    const retrievedReport = await Report.findById(savedReport._id);

    if (retrievedReport && retrievedReport.fileData) {
      console.log('✅ File data retrieved successfully');
      console.log('   File data size:', retrievedReport.fileData.length, 'bytes');
      console.log('   File data matches:', Buffer.isBuffer(retrievedReport.fileData));
      console.log('   Base64 preview:', retrievedReport.fileData.toString('base64').substring(0, 50) + '...\n');
    } else {
      console.error('❌ File data not found');
      return;
    }

    // Test conversion to base64 (for API response)
    console.log('📊 Testing base64 conversion...');
    const base64Data = retrievedReport.fileData.toString('base64');
    console.log('✅ Base64 conversion successful');
    console.log('   Base64 length:', base64Data.length);
    console.log('   First 100 chars:', base64Data.substring(0, 100), '\n');

    // Count reports with file data
    const reportsWithFiles = await Report.countDocuments({ fileData: { $exists: true, $ne: null } });
    console.log('📊 Reports with file data in database:', reportsWithFiles);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFilePreview();
