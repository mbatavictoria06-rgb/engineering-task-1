import { Router } from 'express';
import healthRouter from './health';
import categoriesRouter from './categories';
import productsRouter from './products';
import customersRouter from './customers';
import ordersRouter from './orders';
import orderItemsRouter from './orderItems';

export const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/products', productsRouter);
v1Router.use('/customers', customersRouter);
v1Router.use('/orders', ordersRouter);
v1Router.use('/order-items', orderItemsRouter);
