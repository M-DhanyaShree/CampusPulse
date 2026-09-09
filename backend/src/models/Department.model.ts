import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: Types.ObjectId | null;
  categories: string[];
  slaHoursDefault: number;
  contactEmail?: string;
  contactPhone?: string;
  buildingLocation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    headOfDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    categories: {
      type: [String],
      default: [],
    },
    slaHoursDefault: {
      type: Number,
      default: 48,
      min: [1, 'SLA must be at least 1 hour'],
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    buildingLocation: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
