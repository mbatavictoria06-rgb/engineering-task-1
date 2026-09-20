import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { sendSuccess, sendCollection } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { parseSorting } from '../utils/sorting';
import { Prisma } from '@prisma/client';

const validateUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    const error = new Error('Invalid UUID format') as any;
    error.status = 400;
    error.code = 'INVALID_ID';
    throw error;
  }
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = parsePagination(req.query);
    const { sortField, sortOrder } = parseSorting(req.query, ['name', 'price', 'stockQuantity', 'createdAt', 'updatedAt']);
    
    const where: Prisma.ProductWhereInput = {};
    if (req.query.categoryId) {
      where.categoryId = String(req.query.categoryId);
    }
    if (req.query.isActive !== undefined) {
      where.isActive = req.query.isActive === 'true';
    }
    if (req.query.name) {
      where.name = { contains: String(req.query.name), mode: 'insensitive' };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortField) {
      orderBy[sortField as keyof Prisma.ProductOrderByWithRelationInput] = sortOrder as Prisma.SortOrder;
    }

    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      })
    ]);

    sendCollection(res, data, total, limit, offset);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      const error = new Error('Product not found') as any;
      error.status = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Prisma.ProductCreateInput = {
      name: String(req.body.name),
      price: Number(req.body.price),
      stockQuantity: Number(req.body.stockQuantity),
      category: { connect: { id: String(req.body.categoryId) } }
    };

    if (req.body.description !== undefined) {
      data.description = String(req.body.description);
    }
    if (req.body.isActive !== undefined) {
      data.isActive = Boolean(req.body.isActive);
    }
    
    const product = await prisma.product.create({ data });
    sendSuccess(res, product, 201);
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('Category not found') as any;
      error.status = 404;
      error.code = 'CATEGORY_NOT_FOUND';
      return next(error);
    }
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const data: Prisma.ProductUpdateInput = {};
    if (req.body.name !== undefined) data.name = String(req.body.name);
    if (req.body.description !== undefined) data.description = String(req.body.description);
    if (req.body.price !== undefined) data.price = Number(req.body.price);
    if (req.body.stockQuantity !== undefined) data.stockQuantity = Number(req.body.stockQuantity);
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);
    if (req.body.categoryId !== undefined) {
      data.category = { connect: { id: String(req.body.categoryId) } };
    }

    const product = await prisma.product.update({
      where: { id },
      data
    });

    sendSuccess(res, product);
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error(String(err.meta?.cause || 'Product or related Category not found')) as any;
      error.status = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('Product not found') as any;
      error.status = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      return next(error);
    }
    if (err.code === 'P2003') {
      const error = new Error('Cannot delete product because it is referenced by existing order items') as any;
      error.status = 400;
      error.code = 'FOREIGN_KEY_CONSTRAINT';
      return next(error);
    }
    next(err);
  }
};
