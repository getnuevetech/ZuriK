import { FabricSeller } from './user';

export interface Fabric {
  id: string;
  name: string;
  description: string;
  customerPrice: number;
  material: string;
  color: string;
  pattern: string;
  country: string;
  stock: number;
  images?: string[];
  isActive: boolean;
  seller?: FabricSeller;
  createdAt: string;
  updatedAt: string;
}
