import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum FabricType {
  COTTON = 'cotton',
  SILK = 'silk',
  ANKARA = 'ankara',
  KENTE = 'kente',
  DASHIKI = 'dashiki',
  ADIRE = 'adire',
  MUDCLOTH = 'mudcloth',
  KITENGE = 'kitenge',
  LINEN = 'linen',
  VELVET = 'velvet',
  OTHER = 'other',
}

@Entity('fabrics')
export class Fabric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'price_per_meter', type: 'decimal', precision: 10, scale: 2 })
  pricePerMeter: number;

  @Column({ name: 'stock_quantity', type: 'integer' })
  stockQuantity: number;

  @Column({ type: 'simple-array' })
  images: string[];

  @Column({ type: 'simple-array' })
  colors: string[];

  @Column({
    name: 'fabric_type',
    type: 'enum',
    enum: FabricType,
  })
  fabricType: FabricType;

  @Column({ name: 'seller_id' })
  sellerId: string;

  @ManyToOne(() => User, (user) => user.fabrics)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column()
  country: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'width_inches', type: 'integer', nullable: true })
  widthInches: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
