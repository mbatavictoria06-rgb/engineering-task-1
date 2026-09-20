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

export const listCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = parsePagination(req.query);
    const { sortField, sortOrder } = parseSorting(req.query, ['firstName', 'lastName', 'email', 'createdAt', 'updatedAt']);
    
    const where: Prisma.CustomerWhereInput = {};
    if (req.query.email) {
      where.email = { contains: String(req.query.email), mode: 'insensitive' };
    }
    if (req.query.city) {
      where.city = { contains: String(req.query.city), mode: 'insensitive' };
    }
    if (req.query.country) {
      where.country = { contains: String(req.query.country), mode: 'insensitive' };
    }

    const orderBy: Prisma.CustomerOrderByWithRelationInput = {};
    if (sortField) {
      orderBy[sortField as keyof Prisma.CustomerOrderByWithRelationInput] = sortOrder as Prisma.SortOrder;
    }

    const [total, data] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
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

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      const error = new Error('Customer not found') as any;
      error.status = 404;
      error.code = 'CUSTOMER_NOT_FOUND';
      throw error;
    }

    sendSuccess(res, customer);
  } catch (err) {
    next(err);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Prisma.CustomerCreateInput = {
      firstName: String(req.body.firstName),
      lastName: String(req.body.lastName),
      email: String(req.body.email),
    };

    if (req.body.phone !== undefined) data.phone = String(req.body.phone);
    if (req.body.city !== undefined) data.city = String(req.body.city);
    if (req.body.country !== undefined) data.country = String(req.body.country);
    
    const customer = await prisma.customer.create({ data });
    sendSuccess(res, customer, 201);
  } catch (err: any) {
    if (err.code === 'P2002') {
      const error = new Error('Email already exists') as any;
      error.status = 400;
      error.code = 'UNIQUE_CONSTRAINT_VIOLATION';
      return next(error);
    }
    next(err);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    const data: Prisma.CustomerUpdateInput = {};
    if (req.body.firstName !== undefined) data.firstName = String(req.body.firstName);
    if (req.body.lastName !== undefined) data.lastName = String(req.body.lastName);
    if (req.body.email !== undefined) data.email = String(req.body.email);
    if (req.body.phone !== undefined) data.phone = String(req.body.phone);
    if (req.body.city !== undefined) data.city = String(req.body.city);
    if (req.body.country !== undefined) data.country = String(req.body.country);

    const customer = await prisma.customer.update({
      where: { id },
      data
    });

    sendSuccess(res, customer);
  } catch (err: any) {
    if (err.code === 'P2002') {
      const error = new Error('Email already exists') as any;
      error.status = 400;
      error.code = 'UNIQUE_CONSTRAINT_VIOLATION';
      return next(error);
    }
    if (err.code === 'P2025') {
      const error = new Error('Customer not found') as any;
      error.status = 404;
      error.code = 'CUSTOMER_NOT_FOUND';
      return next(error);
    }
    next(err);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    validateUUID(id);

    await prisma.customer.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('Customer not found') as any;
      error.status = 404;
      error.code = 'CUSTOMER_NOT_FOUND';
      return next(error);
    }
    if (err.code === 'P2003') {
      const error = new Error('Cannot delete customer because they are referenced by existing orders') as any;
      error.status = 400;
      error.code = 'FOREIGN_KEY_CONSTRAINT';
      return next(error);
    }
    next(err);
  }
};
