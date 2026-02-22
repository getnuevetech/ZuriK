import { Product } from './product';
import { Fabric } from './fabric';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'awaiting_materials'
  | 'in_production'
  | 'shipped_to_qa'
  | 'qa_inspection'
  | 'qa_approved'
  | 'qa_rejected'
  | 'shipped_to_customer'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  orderType: 'CUSTOM_DESIGN' | 'READY_TO_WEAR' | 'FABRIC_ONLY';
  status: OrderStatus;
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
