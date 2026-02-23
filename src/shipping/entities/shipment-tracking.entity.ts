import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ShippingMethod } from './shipping-method.entity';

@Entity('shipment_trackings')
export class ShipmentTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => ShippingMethod, { eager: true })
  shippingMethod: ShippingMethod;

  @Column()
  shippingMethodId: string;

  @Column({ type: 'varchar', nullable: true })
  trackingNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  carrier: string | null;

  @Column({ type: 'varchar', nullable: true })
  carrierTrackingUrl: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shippingCost: number;

  @Column({ type: 'text', nullable: true })
  shippingAddress: string | null;

  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
