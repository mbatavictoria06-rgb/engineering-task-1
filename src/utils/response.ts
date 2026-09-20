import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, statusCode = 200) => {
  return res.status(statusCode).json({ data });
};

export const sendCollection = (
  res: Response,
  data: any[],
  total: number,
  limit: number,
  offset: number,
  statusCode = 200
) => {
  const hasMore = offset + data.length < total;
  return res.status(statusCode).json({
    data,
    meta: {
      total,
      limit,
      offset,
      hasMore,
    },
  });
};
