import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { sendSuccess, sendCollection } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { parseSorting } from '../utils/sorting';
import { Prisma, OrderStatus } from '@prisma/client';

const validateUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    const error = new Error('Invalid UUID format') as any;
    error.status = 400;
    error.code = 'INVALID_ID';
    throw error;
  }
};

export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = parsePagination(req.query);
    const { sortField, sortOrder } = parseSorting(req.query, ['status', 'totalAmount', 'createdAt', 'updatedAt']);
    
    const where: Prisma.OrderWhereInput = {};
    if (req.query.customerId) {
      where.customerId = String(req.query.customerId);
    }
    if (req.query.status) {
      where.status = req.query.status as OrderStatus;
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (sortField) {
      orderBy[sortField as keyof Prisma.OrderOrderByWithRelationInput] = sortOrder as Prisma.SortOrder;
    }

    const [total, data] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
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

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      const error = new Error('Order not found') as any;
      error.status = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Prisma.OrderCreateInput = {
      totalAmount: Number(req.body.totalAmount),
      customer: { connect: { id: String(req.body.customerId) } }
    };

    if (req.body.status) {
      data.status = req.body.status as OrderStatus;
    }
    
    const order = await prisma.order.create({ data });
    sendSuccess(res, order, 201);
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('Customer not found') as any;
      error.status = 404;
      error.code = 'CUSTOMER_NOT_FOUND';
      return next(error);
    }
    next(err);
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const data: Prisma.OrderUpdateInput = {};
    if (req.body.status !== undefined) data.status = req.body.status as OrderStatus;
    if (req.body.totalAmount !== undefined) data.totalAmount = Number(req.body.totalAmount);

    const order = await prisma.order.update({
      where: { id },
      data
    });

    sendSuccess(res, order);
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('Order not found') as any;
      error.status = 404;
      error.code = 'ORDER_NOT_FOUND';
      return next(error);
    }
    next(err);
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    await prisma.order.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('Order not found') as any;
      error.status = 404;
      error.code = 'ORDER_NOT_FOUND';
      return next(error);
    }
    if (err.code === 'P2003') {
      const error = new Error('Cannot delete order because it is referenced by existing order items') as any;
      error.status = 400;
      error.code = 'FOREIGN_KEY_CONSTRAINT';
      return next(error);
    }
    next(err);
  }
};
