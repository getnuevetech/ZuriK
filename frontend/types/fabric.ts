import { FabricSeller } from './user';

export interface Fabric {
  id: string;
  name: string;
  description: string;
  customerPrice: number;
  sellerPrice?: number;
  type?: string;
  material?: string;
  colors?: string[];
  patterns?: string[];
  width?: number;
  stock: number;
  images?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  seller?: FabricSeller;
  createdAt: string;
  updatedAt: string;
}
