import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

async function initializeDatabase() {
  try {
    await connectToDatabase();

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log('✅ Database already initialized with users');
      return;
    }

    console.log('🔄 Initializing database with demo users...');

    const demoUsers = [
      {
        name: 'System Admin',
        email: 'admin@northsouth.edu',
        password: 'admin123',
        role: 'admin',
        nsuId: 'ADM-0001',
        department: 'Administration',
        verified: true,
      },
      {
        name: 'Dr. Rahman Khan',
        email: 'rahman.khan@northsouth.edu',
        password: 'teacher123',
        role: 'teacher',
        nsuId: 'FAC-1001',
        department: 'Computer Science',
        verified: true,
      },
      {
        name: 'Ariful Islam',
        email: 'ariful.islam@northsouth.edu',
        password: 'student123',
        role: 'student',
        nsuId: '2012345678',
        department: 'Computer Science',
        verified: true,
      },
      {
        name: 'Fatima Noor',
        email: 'fatima.noor@northsouth.edu',
        password: 'student123',
        role: 'student',
        nsuId: '2013456789',
        department: 'Electrical Engineering',
        verified: true,
      },
    ];

    // Hash passwords and create users
    const saltRounds = 10;
    const usersToCreate = await Promise.all(
      demoUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, saltRounds),
      }))
    );

    await User.insertMany(usersToCreate);

    console.log('✅ Database initialized with 4 demo users:');
    console.log('   📧 admin@northsouth.edu / admin123');
    console.log('   📧 rahman.khan@northsouth.edu / teacher123');
    console.log('   📧 ariful.islam@northsouth.edu / student123');
    console.log('   📧 fatima.noor@northsouth.edu / student123');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

export default initializeDatabase;
