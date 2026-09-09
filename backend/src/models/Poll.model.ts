import mongoose, { Document, Schema, Types } from 'mongoose';
import { PollStatus } from '../constants/complaint.js';

export interface IPollOption {
  _id?: Types.ObjectId;
  text: string;
  voteCount: number;
}

export interface IPoll extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  options: IPollOption[];
  departmentId?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  status: PollStatus;
  startDate: Date;
  endDate: Date;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  totalVotes: number;
  sentimentSummary?: {
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PollOptionSchema = new Schema<IPollOption>(
  {
    text: { type: String, required: true, trim: true },
    voteCount: { type: Number, default: 0 },
  },
  { _id: true }
);

const PollSchema = new Schema<IPoll>(
  {
    title: {
      type: String,
      required: [true, 'Poll title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Poll description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    options: {
      type: [PollOptionSchema],
      validate: [
        (val: IPollOption[]) => val.length >= 2,
        'Poll must contain at least 2 options',
      ],
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PollStatus),
      default: PollStatus.ACTIVE,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    sentimentSummary: {
      positivePercentage: { type: Number, default: 0 },
      neutralPercentage: { type: Number, default: 0 },
      negativePercentage: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);
