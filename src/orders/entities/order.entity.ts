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
import { User } from '../../user/user.entity';
import { Product } from '../../product.entity';
import { Fabric } from '../../fabric.entity';
import { Measurement } from '../../measurements/entities/measurement.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderNumber: string;

  @ManyToOne(() => User)
  @JoinColumn()
  customer: User;

  @ManyToOne(() => Product)
  @JoinColumn()
  design: Product;

  @ManyToOne(() => Fabric)
  @JoinColumn()
  fabric: Fabric;

  @Column('decimal', { precision: 10, scale: 2 })
  designPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  fabricPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  designerEarnings: number;

  @Column('decimal', { precision: 10, scale: 2 })
  fabricSellerEarnings: number;

  @Column('decimal', { precision: 10, scale: 2 })
  platformFee: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string;

  @OneToOne(() => Measurement)
  @JoinColumn()
  measurements: Measurement;

  @Column({ type: 'text', nullable: true })
  customerNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
