import { z } from 'zod';

export const createPollSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  category: z.string().min(2),
  options: z.array(z.string().min(1)).min(2, 'At least 2 options required'),
  departmentId: z.string().optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid end date format is required',
  }),
  allowMultipleVotes: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
});

export const votePollSchema = z.object({
  selectedOptionId: z.string().min(1, 'Selected option is required'),
  feedbackText: z.string().max(500).optional(),
});
