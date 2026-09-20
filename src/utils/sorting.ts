export interface SortingOptions {
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export const parseSorting = (query: any, allowedFields: string[]): SortingOptions => {
  const sortOrder = query.order ? String(query.order).toLowerCase() : 'asc';
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    const error = new Error('Invalid sort order. Allowed values: asc, desc') as any;
    error.status = 400;
    error.code = 'INVALID_SORT_ORDER';
    throw error;
  }

  if (!query.sort) {
    return {};
  }

  const sortField = String(query.sort);
  if (!allowedFields.includes(sortField)) {
    const error = new Error(`Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`) as any;
    error.status = 400;
    throw error;
  }

  return { sortField, sortOrder };
};
