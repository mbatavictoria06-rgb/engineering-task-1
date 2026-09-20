import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate';
import { 
  OrderItemQuerySchema, 
  CreateOrderItemSchema, 
  UpdateOrderItemSchema 
} from '../schemas/orderItem.schema';
import * as orderItemController from '../controllers/orderItem.controller';

const router = Router();

router.get('/', validateQuery(OrderItemQuerySchema), orderItemController.listOrderItems);
router.get('/:id', orderItemController.getOrderItem);
router.post('/', validateBody(CreateOrderItemSchema), orderItemController.createOrderItem);
router.patch('/:id', validateBody(UpdateOrderItemSchema), orderItemController.updateOrderItem);
router.delete('/:id', orderItemController.deleteOrderItem);

export default router;
