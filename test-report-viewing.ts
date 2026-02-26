import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/lib/models/Report';
import User from '@/lib/models/User';

async function testReportViewing() {
  try {
    await connectToDatabase();

    console.log('🔄 Testing report viewing functionality...\n');

    // Get a teacher and student
    const teacher = await User.findOne({ role: 'teacher' });
    const student = await User.findOne({ role: 'student' });

    if (!teacher || !student) {
      console.error('❌ Teacher or student not found');
      return;
    }

    console.log('✅ Found users:');
    console.log('   Teacher:', teacher.name, `(ID: ${teacher._id})`);
    console.log('   Student:', student.name, `(ID: ${student._id})\n`);

    // Create test reports if they don't exist
    const existingReports = await Report.countDocuments();
    console.log(`📊 Existing reports in database: ${existingReports}\n`);

    if (existingReports === 0) {
      console.log('📝 Creating test reports...');
      const testReports = [
        {
          fileName: 'Assignment_01.pdf',
          fileType: 'pdf',
          fileSize: 1500000,
          uploadedBy: teacher._id.toString(),
          uploadedByName: teacher.name,
          studentId: student._id.toString(),
          studentName: student.name,
          status: 'processing',
          similarityPercentage: 18,
          verdict: null,
          verdictBy: null,
          verdictByName: null,
          verdictAt: null,
        },
        {
          fileName: 'Report_Final.docx',
          fileType: 'docx',
          fileSize: 2100000,
          uploadedBy: student._id.toString(),
          uploadedByName: student.name,
          studentId: student._id.toString(),
          studentName: student.name,
          status: 'pending',
          similarityPercentage: null,
          verdict: null,
          verdictBy: null,
          verdictByName: null,
          verdictAt: null,
        },
      ];

      await Report.insertMany(testReports);
      console.log('✅ Created 2 test reports\n');
    }

    // Test: Fetch reports for student (should see reports for them and by them)
    console.log('🔍 Simulating student report fetch:');
    const studentReports = await Report.find({
      $or: [
        { studentId: student._id.toString() },
        { uploadedBy: student._id.toString() },
      ],
    }).sort({ createdAt: -1 });

    console.log(`✅ Student can see ${studentReports.length} report(s):`);
    studentReports.forEach((report) => {
      console.log(`   📄 ${report.fileName} - ${report.studentName} (${report.fileType})`);
      console.log(`      Uploaded by: ${report.uploadedByName}`);
      console.log(`      Status: ${report.status}`);
    });

    // Test: Fetch reports for teacher (should see all reports they uploaded)
    console.log('\n🔍 Simulating teacher report fetch:');
    const teacherReports = await Report.find({
      uploadedBy: teacher._id.toString(),
    }).sort({ createdAt: -1 });

    console.log(`✅ Teacher can see ${teacherReports.length} report(s):`);
    teacherReports.forEach((report) => {
      console.log(`   📄 ${report.fileName} - Student: ${report.studentName}`);
      console.log(`      Similarity: ${report.similarityPercentage}%`);
      console.log(`      Status: ${report.status}`);
    });

    // Test: Update verdict
    if (studentReports.length > 0) {
      console.log('\n✏️ Testing verdict update...');
      const reportToUpdate = studentReports[0];
      
      const updatedReport = await Report.findByIdAndUpdate(
        reportToUpdate._id,
        {
          verdict: 'accepted',
          status: 'accepted',
          verdictBy: teacher._id.toString(),
          verdictByName: teacher.name,
          verdictAt: new Date(),
        },
        { new: true }
      );

      console.log('✅ Report verdict updated:');
      console.log(`   File: ${updatedReport?.fileName}`);
      console.log(`   Verdict: ${updatedReport?.verdict}`);
      console.log(`   Reviewed by: ${updatedReport?.verdictByName}`);
    }

    // Count final reports
    const finalCount = await Report.countDocuments();
    console.log(`\n📊 Final report count: ${finalCount}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testReportViewing();
