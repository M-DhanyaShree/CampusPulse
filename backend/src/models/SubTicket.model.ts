import mongoose, { Document, Schema, Types } from 'mongoose';
import { SubTicketStatus } from '../constants/complaint.js';

export interface ISubTicket extends Document {
  _id: Types.ObjectId;
  parentComplaintId: Types.ObjectId;
  title: string;
  description: string;
  assignedDepartmentId: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  status: SubTicketStatus;
  priority: string;
  notes?: string;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubTicketSchema = new Schema<ISubTicket>(
  {
    parentComplaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Sub-ticket title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Sub-ticket description is required'],
      trim: true,
    },
    assignedDepartmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
      enum: Object.values(SubTicketStatus),
      default: SubTicketStatus.ASSIGNED,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const SubTicket = mongoose.model<ISubTicket>('SubTicket', SubTicketSchema);
