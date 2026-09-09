import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPollResponse extends Document {
  _id: Types.ObjectId;
  pollId: Types.ObjectId;
  userId: Types.ObjectId;
  selectedOptionId: Types.ObjectId;
  userRole: string;
  departmentId?: Types.ObjectId | null;
  feedbackText?: string;
  sentimentScore?: number;
  createdAt: Date;
}

const PollResponseSchema = new Schema<IPollResponse>(
  {
    pollId: {
      type: Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    selectedOptionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    feedbackText: {
      type: String,
      trim: true,
    },
    sentimentScore: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple votes from the same user on the same poll
PollResponseSchema.index({ pollId: 1, userId: 1 }, { unique: true });

export const PollResponse = mongoose.model<IPollResponse>('PollResponse', PollResponseSchema);
