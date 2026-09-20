import { z } from 'zod';

const OrderStatusEnum = z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);

export const OrderQuerySchema = z.object({
  customerId: z.string().uuid('Invalid customerId format').optional(),
  status: OrderStatusEnum.optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid('Invalid customerId format'),
  status: OrderStatusEnum.optional(),
  totalAmount: z.number().min(0, 'totalAmount must be non-negative'),
}).strict();

export const UpdateOrderSchema = z.object({
  status: OrderStatusEnum.optional(),
  totalAmount: z.number().min(0, 'totalAmount must be non-negative').optional(),
}).strict().refine(
  data => Object.values(data).some(val => val !== undefined), 
  { message: 'At least one valid field must be provided to update', path: ['body'] }
);
