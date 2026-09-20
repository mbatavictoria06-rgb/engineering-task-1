import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate';
import { 
  CategoryQuerySchema, 
  CreateCategorySchema, 
  UpdateCategorySchema 
} from '../schemas/category.schema';
import * as categoryController from '../controllers/category.controller';

const router = Router();

router.get('/', validateQuery(CategoryQuerySchema), categoryController.listCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', validateBody(CreateCategorySchema), categoryController.createCategory);
router.patch('/:id', validateBody(UpdateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
