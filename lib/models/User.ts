import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  nsuId: string;
  department: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
      required: true,
    },
    nsuId: {
      type: String,
      required: [true, 'Please provide an NSU ID'],
      unique: true,
    },
    department: {
      type: String,
      required: [true, 'Please provide a department'],
    },
    verified: {
      type: Boolean,
      default: function() {
        return (this as any).role === 'student';
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in hot reload
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
