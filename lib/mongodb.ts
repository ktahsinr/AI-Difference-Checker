import dotenv from 'dotenv';
import mongoose, { Connection } from 'mongoose';

// Load environment variables from .env file
dotenv.config();

const MONGO_URI = process.env.MOGNO_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI or MOGNO_URI environment variable inside .env or .env.local');
}

// Create a cached connection to avoid multiple connections in serverless environments
interface MongooseConnection {
  conn: Connection | null;
  promise: Promise<typeof mongoose> | null;
}

const cached: MongooseConnection = {
  conn: null,
  promise: null,
};

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI as string, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
  }

  try {
    await cached.promise;
    cached.conn = mongoose.connection;
    console.log('Database connected successfully');
    return cached.conn;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    cached.promise = null;
    throw error;
  }
}

export default connectToDatabase;
