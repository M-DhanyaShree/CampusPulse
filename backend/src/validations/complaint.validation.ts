import { z } from 'zod';
import { ComplaintStatus } from '../constants/complaint.js';

export const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  departmentId: z.string().optional(),
  category: z.string().optional(),
  isAnonymous: z.union([z.boolean(), z.string()]).optional(),
  campusBlock: z.string().min(2, 'Campus block is required'),
  roomOrArea: z.string().optional(),
  landmark: z.string().optional(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
  notes: z.string().optional(),
  assignedResolverId: z.string().optional(),
});

export const addCommentSchema = z.object({
  text: z.string().min(1, 'Comment text cannot be empty').max(1000),
  isOfficialUpdate: z.union([z.boolean(), z.string()]).optional(),
});

export const checkDuplicateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
});
