import { z } from 'zod';

export const CustomerQuerySchema = z.object({
  email: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
});

export const CreateCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
}).strict();

export const UpdateCustomerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
}).strict().refine(
  data => Object.values(data).some(val => val !== undefined), 
  { message: 'At least one valid field must be provided to update', path: ['body'] }
);
