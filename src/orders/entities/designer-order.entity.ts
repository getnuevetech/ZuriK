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
import { Order } from './order.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Measurement } from '../../measurements/entities/measurement.entity';

@Entity('designer_orders')
export class DesignerOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order)
  order: Order;

  @ManyToOne(() => User)
  designer: User;

  @ManyToOne(() => Product, { eager: true })
  design: Product;

  @OneToOne(() => Measurement, { nullable: true, eager: true })
  @JoinColumn()
  measurement: Measurement;

  @Column('decimal', { precision: 10, scale: 2 })
  earnings: number;

  @Column({ nullable: true })
  shipToName: string;

  @Column({ nullable: true })
  shipToAddress: string;

  @Column({ nullable: true })
  shipToCity: string;

  @Column({ nullable: true })
  shipToCountry: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  fabricTrackingNumber: string;

  @Column({
    type: 'enum',
    enum: ['awaiting_fabric', 'fabric_received', 'in_production', 'shipped_to_qa', 'completed'],
    default: 'awaiting_fabric',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
