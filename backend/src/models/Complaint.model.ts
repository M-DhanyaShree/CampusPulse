import mongoose, { Document, Schema, Types } from 'mongoose';
import { ComplaintStatus, ComplaintUrgency, SentimentLabel } from '../constants/complaint.js';

export interface IAttachment {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
}

export interface IComplaintComment {
  _id?: Types.ObjectId;
  authorId: Types.ObjectId;
  authorName: string;
  authorRole: string;
  text: string;
  isOfficialUpdate: boolean;
  createdAt: Date;
}

export interface IComplaint extends Document {
  _id: Types.ObjectId;
  trackingCode: string;
  title: string;
  description: string;
  createdBy: Types.ObjectId;
  isAnonymous: boolean;
  departmentId: Types.ObjectId;
  category: string;
  mlClassificationConfidence?: number;
  urgency: ComplaintUrgency;
  urgencyScore?: number;
  sentiment?: {
    label: SentimentLabel;
    score: number;
    aspects: string[];
  };
  embedding?: number[];
  location: {
    campusBlock: string;
    roomOrArea?: string;
    landmark?: string;
  };
  status: ComplaintStatus;
  assignedResolver?: Types.ObjectId | null;
  attachments: IAttachment[];
  upvotes: Types.ObjectId[];
  upvoteCount: number;
  comments: IComplaintComment[];
  duplicateOf?: Types.ObjectId | null;
  slaDeadline?: Date;
  resolvedAt?: Date | null;
  resolutionSummary?: string | null;
  rejectionReason?: string | null;
  isEscalated: boolean;
  escalatedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
  },
  { _id: false }
);

const ComplaintCommentSchema = new Schema<IComplaintComment>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    isOfficialUpdate: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ComplaintSchema = new Schema<IComplaint>(
  {
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    mlClassificationConfidence: {
      type: Number,
      default: null,
    },
    urgency: {
      type: String,
      enum: Object.values(ComplaintUrgency),
      default: ComplaintUrgency.MEDIUM,
      index: true,
    },
    urgencyScore: {
      type: Number,
      default: null,
    },
    sentiment: {
      label: {
        type: String,
        enum: Object.values(SentimentLabel),
        default: SentimentLabel.NEUTRAL,
      },
      score: { type: Number, default: 0 },
      aspects: { type: [String], default: [] },
    },
    embedding: {
      type: [Number],
      select: false,
    },
    location: {
      campusBlock: { type: String, required: true, trim: true },
      roomOrArea: { type: String, trim: true },
      landmark: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.SUBMITTED,
      index: true,
    },
    assignedResolver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
      index: true,
    },
    comments: {
      type: [ComplaintCommentSchema],
      default: [],
    },
    duplicateOf: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
      index: true,
    },
    slaDeadline: {
      type: Date,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionSummary: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    isEscalated: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-frequency dashboard queries
ComplaintSchema.index({ departmentId: 1, status: 1, urgency: 1 });
ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ upvoteCount: -1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
