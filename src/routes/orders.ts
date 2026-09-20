import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate';
import { 
  OrderQuerySchema, 
  CreateOrderSchema, 
  UpdateOrderSchema 
} from '../schemas/order.schema';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.get('/', validateQuery(OrderQuerySchema), orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.post('/', validateBody(CreateOrderSchema), orderController.createOrder);
router.patch('/:id', validateBody(UpdateOrderSchema), orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

export default router;
