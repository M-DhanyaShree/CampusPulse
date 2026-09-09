import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  description: z.string().optional(),
  headOfDepartment: z.string().optional(),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  slaHoursDefault: z.number().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  buildingLocation: z.string().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();
