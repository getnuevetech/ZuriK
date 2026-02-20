import { Product } from './product';
import { Fabric } from './fabric';

export interface Order {
  id: string;
  orderNumber: string;
  orderType: 'CUSTOM_DESIGN' | 'READY_TO_WEAR' | 'FABRIC_ONLY';
  status: string;
  design?: Product;
  fabric?: Fabric;
  designPrice?: number;
  fabricPrice?: number;
  totalPrice: number;
  customerNotes?: string;
  quantity: number;
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeveLength?: number;
  length?: number;
  unit?: string;
  measurementNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomDesignOrderDto {
  designId: string;
  fabricId: string;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  sleeveLength: number;
  length: number;
  unit?: string;
  measurementNotes?: string;
  customerNotes?: string;
}

export interface CreateReadyToWearOrderDto {
  designId: string;
  quantity?: number;
  customerNotes?: string;
}

export interface CreateFabricOnlyOrderDto {
  fabricId: string;
  quantity?: number;
  customerNotes?: string;
}
