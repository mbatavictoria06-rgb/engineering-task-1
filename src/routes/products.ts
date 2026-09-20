import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate';
import { 
  ProductQuerySchema, 
  CreateProductSchema, 
  UpdateProductSchema 
} from '../schemas/product.schema';
import * as productController from '../controllers/product.controller';

const router = Router();

router.get('/', validateQuery(ProductQuerySchema), productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', validateBody(CreateProductSchema), productController.createProduct);
router.patch('/:id', validateBody(UpdateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
