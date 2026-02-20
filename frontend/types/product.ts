import { Designer } from './user';

export interface Product {
  id: string;
  name: string;
  description: string;
  customerPrice: number;
  designerPrice?: number;
  category: string;
  country: string;
  images?: string[];
  isActive: boolean;
  designer?: Designer;
  createdAt: string;
  updatedAt: string;
}
