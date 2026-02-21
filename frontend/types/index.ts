export * from './user';
export * from './product';
export * from './fabric';
export * from './order';
export * from './settings';
export * from './hero-banner';
export * from './analytics';
export * from './payment';
export * from './review';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
