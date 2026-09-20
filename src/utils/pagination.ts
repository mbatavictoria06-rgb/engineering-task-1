export interface PaginationOptions {
  limit: number;
  offset: number;
}

export const parsePagination = (query: any): PaginationOptions => {
  let limit = 20;
  let offset = 0;

  if (query.limit !== undefined) {
    const parsedLimit = parseInt(String(query.limit), 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      const error = new Error('Invalid limit parameter') as any;
      error.status = 400;
      throw error;
    }
    limit = Math.min(parsedLimit, 100);
  }

  if (query.offset !== undefined) {
    const parsedOffset = parseInt(String(query.offset), 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      const error = new Error('Offset cannot be negative') as any;
      error.status = 400;
      throw error;
    }
    offset = parsedOffset;
  }

  return { limit, offset };
};
