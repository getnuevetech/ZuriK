import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from '../../users/entities/user.entity';
import { Fabric } from '../../fabrics/entities/fabric.entity';

@Entity('fabric_seller_orders')
export class FabricSellerOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order)
  order: Order;

  @ManyToOne(() => User)
  fabricSeller: User;

  @ManyToOne(() => Fabric, { eager: true })
  fabric: Fabric;

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

  @Column({ type: 'enum', enum: ['pending', 'processing', 'shipped', 'delivered'], default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
