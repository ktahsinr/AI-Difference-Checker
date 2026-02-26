import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase } from './lib/mongodb';

// Load environment variables from .env file
dotenv.config();

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...');
  console.log('📝 Environment URI loaded:', process.env.MOGNO_URI ? '✅ Yes' : '❌ No');
  
  try {
    const conn = await connectToDatabase();
    
    if (conn) {
      console.log('✅ Connection successful!');
      console.log(`📊 Connected to database: ${conn.name}`);
      console.log(`🌐 Host: ${conn.host}`);
      console.log(`🔌 State: ${conn.states[conn.readyState]} (${conn.readyState})`);
      
      // Disconnect after testing
      await mongoose.disconnect();
      console.log('✅ Disconnected gracefully');
    }
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testConnection();
