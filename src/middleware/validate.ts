import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      for (const key in req.query) { delete req.query[key]; }
      Object.assign(req.query, parsed);
      next();
    } catch (error: any) {
      if (error && error.name === 'ZodError') {
        const issues = error.errors || error.issues || [];
        const message = issues.map((e: any) => `${(e.path || []).join('.')}: ${e.message}`).join(', ') || 'Validation failed';
        const customError = new Error(message) as any;
        customError.status = 400;
        customError.code = 'VALIDATION_ERROR';
        return next(customError);
      }
      next(error);
    }
  };
};
