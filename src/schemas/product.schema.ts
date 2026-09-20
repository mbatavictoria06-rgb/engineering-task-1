import { z } from 'zod';

export const ProductQuerySchema = z.object({
  categoryId: z.string().uuid('Invalid categoryId format').optional(),
  isActive: z.enum(['true', 'false']).optional(),
  name: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
});

export const CreateProductSchema = z.object({
  categoryId: z.string().uuid('Invalid categoryId format'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  stockQuantity: z.number().int().min(0, 'Stock must be a non-negative integer'),
  isActive: z.boolean().optional(),
}).strict();

export const UpdateProductSchema = z.object({
  categoryId: z.string().uuid('Invalid categoryId format').optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
}).strict().refine(
  data => Object.values(data).some(val => val !== undefined), 
  { message: 'At least one valid field must be provided to update', path: ['body'] }
);
