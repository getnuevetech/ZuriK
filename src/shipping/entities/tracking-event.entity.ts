import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ShipmentTracking } from './shipment-tracking.entity';

@Entity('tracking_events')
export class TrackingEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ShipmentTracking, { onDelete: 'CASCADE' })
  shipment: ShipmentTracking;

  @Column()
  shipmentId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
  })
  status: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @CreateDateColumn()
  timestamp: Date;
}
