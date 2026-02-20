import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Fabric } from '../../fabrics/entities/fabric.entity';
import { Measurement } from '../../measurements/entities/measurement.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  AWAITING_MATERIALS = 'AWAITING_MATERIALS',
  IN_PRODUCTION = 'IN_PRODUCTION',
  SHIPPED_TO_QA = 'SHIPPED_TO_QA',
  QA_INSPECTION = 'QA_INSPECTION',
  QA_APPROVED = 'QA_APPROVED',
  QA_REJECTED = 'QA_REJECTED',
  SHIPPED_TO_CUSTOMER = 'SHIPPED_TO_CUSTOMER',
  DELIVERED = 'DELIVERED',
  // Legacy statuses for backward compat
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PRODUCTION_LEGACY = 'IN_PRODUCTION_LEGACY',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  customer: User;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn()
  design: Product;

  @ManyToOne(() => Fabric, { nullable: true })
  @JoinColumn()
  fabric: Fabric;

  @ManyToOne(() => Measurement, { nullable: true })
  @JoinColumn()
  measurement: Measurement;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'qaAssigneeId' })
  qaAssignee: User;

  // Pricing
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  designPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  fabricPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  platformFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  // Legacy
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalPrice: number;

  // Payouts
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  designerPayout: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  fabricSellerPayout: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  platformRevenue: number;

  // Legacy payout fields
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  designerEarnings: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  fabricSellerEarnings: number;

  // Addresses
  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: object;

  @Column({ type: 'jsonb', nullable: true })
  qaAddress: object;

  // Status
  @Column({ default: OrderStatus.PENDING_PAYMENT })
  status: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ type: 'text', nullable: true })
  customerNotes: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  shippedAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  qaApprovedAt: Date;

  @Column({ nullable: true })
  qaRejectedAt: Date;
}
