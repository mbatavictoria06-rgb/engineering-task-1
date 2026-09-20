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

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = parsePagination(req.query);
    const { sortField, sortOrder } = parseSorting(req.query, ['name', 'createdAt', 'updatedAt']);
    
    const where: Prisma.CategoryWhereInput = {};
    if (req.query.name) {
      where.name = { contains: String(req.query.name), mode: 'insensitive' };
    }
    if (req.query.createdAfter) {
      const date = new Date(String(req.query.createdAfter));
      if (isNaN(date.getTime())) {
        const error = new Error('Invalid date value for createdAfter') as any;
        error.status = 400;
        error.code = 'BAD_REQUEST';
        throw error;
      }
      where.createdAt = { gt: date };
    }

    const orderBy: Prisma.CategoryOrderByWithRelationInput = {};
    if (sortField) {
      orderBy[sortField as keyof Prisma.CategoryOrderByWithRelationInput] = sortOrder as Prisma.SortOrder;
    }

    const [total, data] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
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

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      const error = new Error('Category not found') as any;
      error.status = 404;
      error.code = 'CATEGORY_NOT_FOUND';
      throw error;
    }

    sendSuccess(res, category);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = String(req.body.name);
    const data: Prisma.CategoryCreateInput = { name };
    if (req.body.description !== undefined) {
      data.description = String(req.body.description);
    }
    
    const category = await prisma.category.create({ data });
    sendSuccess(res, category, 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const name = req.body.name !== undefined ? String(req.body.name) : undefined;
    const description = req.body.description !== undefined ? String(req.body.description) : undefined;

    const data: Prisma.CategoryUpdateInput = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;

    const category = await prisma.category.update({
      where: { id },
      data
    });

    sendSuccess(res, category);
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

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('Category not found') as any;
      error.status = 404;
      error.code = 'CATEGORY_NOT_FOUND';
      return next(error);
    }
    if (err.code === 'P2003') {
      const error = new Error('Cannot delete category because it is referenced by existing products') as any;
      error.status = 400;
      error.code = 'FOREIGN_KEY_CONSTRAINT';
      return next(error);
    }
    next(err);
  }
};
