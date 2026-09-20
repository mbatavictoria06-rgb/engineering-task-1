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

export const listOrderItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = parsePagination(req.query);
    const { sortField, sortOrder } = parseSorting(req.query, ['quantity', 'unitPrice', 'createdAt']);
    
    const where: Prisma.OrderItemWhereInput = {};
    if (req.query.orderId) {
      where.orderId = String(req.query.orderId);
    }
    if (req.query.productId) {
      where.productId = String(req.query.productId);
    }

    const orderBy: Prisma.OrderItemOrderByWithRelationInput = {};
    if (sortField) {
      orderBy[sortField as keyof Prisma.OrderItemOrderByWithRelationInput] = sortOrder as Prisma.SortOrder;
    }

    const [total, data] = await Promise.all([
      prisma.orderItem.count({ where }),
      prisma.orderItem.findMany({
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

export const getOrderItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const orderItem = await prisma.orderItem.findUnique({ where: { id } });
    if (!orderItem) {
      const error = new Error('OrderItem not found') as any;
      error.status = 404;
      error.code = 'ORDER_ITEM_NOT_FOUND';
      throw error;
    }

    sendSuccess(res, orderItem);
  } catch (err) {
    next(err);
  }
};

export const createOrderItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Prisma.OrderItemCreateInput = {
      quantity: Number(req.body.quantity),
      unitPrice: Number(req.body.unitPrice),
      order: { connect: { id: String(req.body.orderId) } },
      product: { connect: { id: String(req.body.productId) } }
    };
    
    const orderItem = await prisma.orderItem.create({ data });
    sendSuccess(res, orderItem, 201);
  } catch (err: any) {
    if (err.code === 'P2025' || err.code === 'P2003') {
      const error = new Error('Referenced Order or Product not found') as any;
      error.status = 404;
      error.code = 'REFERENCE_NOT_FOUND';
      return next(error);
    }
    next(err);
  }
};

export const updateOrderItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const data: Prisma.OrderItemUpdateInput = {};
    if (req.body.quantity !== undefined) data.quantity = Number(req.body.quantity);
    if (req.body.unitPrice !== undefined) data.unitPrice = Number(req.body.unitPrice);

    const orderItem = await prisma.orderItem.update({
      where: { id },
      data
    });

    sendSuccess(res, orderItem);
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('OrderItem not found') as any;
      error.status = 404;
      error.code = 'ORDER_ITEM_NOT_FOUND';
      return next(error);
    }
    next(err);
  }
};

export const deleteOrderItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    await prisma.orderItem.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('OrderItem not found') as any;
      error.status = 404;
      error.code = 'ORDER_ITEM_NOT_FOUND';
      return next(error);
    }
    next(err);
  }
};
