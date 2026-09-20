import { z } from 'zod';

export const OrderItemQuerySchema = z.object({
  orderId: z.string().uuid('Invalid orderId format').optional(),
  productId: z.string().uuid('Invalid productId format').optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
});

export const CreateOrderItemSchema = z.object({
  orderId: z.string().uuid('Invalid orderId format'),
  productId: z.string().uuid('Invalid productId format'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'unitPrice must be non-negative'),
}).strict();

export const UpdateOrderItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  unitPrice: z.number().min(0, 'unitPrice must be non-negative').optional(),
}).strict().refine(
  data => Object.values(data).some(val => val !== undefined), 
  { message: 'At least one valid field must be provided to update', path: ['body'] }
);
