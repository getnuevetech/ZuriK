import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Fabric } from '../../fabrics/entities/fabric.entity';
import { Measurement } from '../../measurements/entities/measurement.entity';

export enum OrderType {
  CUSTOM_DESIGN = 'custom_design',
  READY_TO_WEAR = 'ready_to_wear',
  FABRIC_ONLY = 'fabric_only',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  AWAITING_MATERIALS = 'awaiting_materials',
  IN_PRODUCTION = 'in_production',
  SHIPPED_TO_QA = 'shipped_to_qa',
  QA_INSPECTION = 'qa_inspection',
  QA_APPROVED = 'qa_approved',
  QA_REJECTED = 'qa_rejected',
  SHIPPED_TO_CUSTOMER = 'shipped_to_customer',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ type: 'enum', enum: OrderType })
  orderType: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @ManyToOne(() => User)
  customer: User;

  @ManyToOne(() => Product, { nullable: true, eager: true })
  design: Product;

  @ManyToOne(() => Fabric, { nullable: true, eager: true })
  fabric: Fabric;

  @OneToOne(() => Measurement, { nullable: true, eager: true })
  @JoinColumn()
  measurement: Measurement;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  designPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  fabricPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  designerEarnings: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  fabricSellerEarnings: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  platformFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ nullable: true })
  fabricToDesignerTracking: string;

  @Column({ nullable: true })
  designerToQaTracking: string;

  @Column({ nullable: true })
  qaToCustomerTracking: string;

  @Column({ type: 'text', nullable: true })
  customerNotes: string;

  @Column({ type: 'text', nullable: true })
  qaComments: string;

  @Column({ nullable: true })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
