import { z } from 'zod';

export const CategoryQuerySchema = z.object({
  name: z.string().optional(),
  createdAfter: z.string().optional(), 
  limit: z.string().optional(),
  offset: z.string().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
}).strict(); 

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
}).strict().refine(data => data.name !== undefined || data.description !== undefined, {
  message: 'At least one valid field (name or description) must be provided to update',
  path: ['body']
});
