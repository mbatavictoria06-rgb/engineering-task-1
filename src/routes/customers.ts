import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate';
import { 
  CustomerQuerySchema, 
  CreateCustomerSchema, 
  UpdateCustomerSchema 
} from '../schemas/customer.schema';
import * as customerController from '../controllers/customer.controller';

const router = Router();

router.get('/', validateQuery(CustomerQuerySchema), customerController.listCustomers);
router.get('/:id', customerController.getCustomer);
router.post('/', validateBody(CreateCustomerSchema), customerController.createCustomer);
router.patch('/:id', validateBody(UpdateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
