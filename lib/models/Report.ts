import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  fileName: string;
  fileType: 'pdf' | 'docx';
  fileSize: number;
  fileData?: Buffer; // Store file as binary data
  uploadedBy: string;
  uploadedByName: string;
  studentId: string;
  studentName: string;
  status: 'pending' | 'processing' | 'accepted' | 'rejected';
  similarityPercentage: number | null;
  verdict: 'accepted' | 'rejected' | null;
  verdictBy: string | null;
  verdictByName: string | null;
  verdictAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    fileName: {
      type: String,
      required: [true, 'Please provide a file name'],
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileData: {
      type: Buffer,
      default: null,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    uploadedByName: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'accepted', 'rejected'],
      default: 'pending',
    },
    similarityPercentage: {
      type: Number,
      default: null,
    },
    matches: {
      type: Array,
      default: [],
    },
    verdict: {
      type: String,
      enum: ['accepted', 'rejected', null],
      default: null,
    },
    verdictBy: {
      type: String,
      default: null,
    },
    verdictByName: {
      type: String,
      default: null,
    },
    verdictAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
