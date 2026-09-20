import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: ((err as any).errors || (err as any).issues).map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
      }
    });
  }

  const status = err.status || 500;
  console.log('DEBUG ERROR:', err);
  
  let code = err.code;
  if (!code) {
    if (status === 400) code = 'BAD_REQUEST';
    else if (status === 404) code = 'NOT_FOUND';
    else if (status === 422) code = 'VALIDATION_ERROR';
    else if (status === 429) code = 'RATE_LIMIT_EXCEEDED';
    else code = 'INTERNAL_SERVER_ERROR';
  }

  const message = status === 500 ? 'An unexpected error occurred' : err.message;

  if (status === 500) {
    console.error('Unhandled Server Error:', err);
  }

  res.status(status).json({
    error: {
      code,
      message
    }
  });
};
