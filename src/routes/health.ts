import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/response';

const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  console.log('HEALTH CHECK IP:', req.ip, 'HEADERS:', req.headers['x-forwarded-for']);
  sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
});

export default healthRouter;
