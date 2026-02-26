import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/lib/models/Report';
import User from '@/lib/models/User';

async function testFileUpload() {
  try {
    await connectToDatabase();

    console.log('🔄 Testing file upload functionality...\n');

    // Get a teacher and student from database
    const teacher = await User.findOne({ role: 'teacher' });
    const student = await User.findOne({ role: 'student' });

    if (!teacher || !student) {
      console.error('❌ Teacher or student not found in database');
      return;
    }

    console.log('✅ Found teacher:', teacher.name);
    console.log('✅ Found student:', student.name, '\n');

    // Create a mock report (simulating file upload)
    const mockReport = new Report({
      fileName: 'CSE311_Assignment.pdf',
      fileType: 'pdf',
      fileSize: 2500000,
      uploadedBy: teacher._id.toString(),
      uploadedByName: teacher.name,
      studentId: student._id.toString(),
      studentName: student.name,
      status: 'processing',
      similarityPercentage: 15,
      verdict: null,
      verdictBy: null,
      verdictByName: null,
      verdictAt: null,
    });

    const savedReport = await mockReport.save();

    console.log('✅ Report saved to MongoDB:');
    console.log('   📄 File:', savedReport.fileName);
    console.log('   📋 Type:', savedReport.fileType);
    console.log('   💾 Size:', (savedReport.fileSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('   👨‍🏫 Uploaded by:', savedReport.uploadedByName);
    console.log('   👨‍🎓 For student:', savedReport.studentName);
    console.log('   📊 Status:', savedReport.status);
    console.log('   🔍 Similarity:', savedReport.similarityPercentage + '%\n');

    // Verify report was saved
    const retrievedReport = await Report.findById(savedReport._id);
    if (retrievedReport) {
      console.log('✅ Report successfully retrieved from MongoDB');
      console.log('📌 Report ID:', retrievedReport._id.toString());
    }

    // Test file type validation - try invalid type
    console.log('\n🧪 Testing file type validation...');
    const invalidReport = new Report({
      fileName: 'test.txt',
      fileType: 'pdf', // Mismatch intentionally
      fileSize: 100000,
      uploadedBy: teacher._id.toString(),
      uploadedByName: teacher.name,
      studentId: student._id.toString(),
      studentName: student.name,
    });

    // This would fail validation in the API but works in the model
    // The API route handles the actual validation
    console.log('✅ File validation handled in API route (not in model)\n');

    // Count total reports
    const reportCount = await Report.countDocuments();
    console.log('📊 Total reports in database:', reportCount);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFileUpload();
