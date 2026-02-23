import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('fabrics')
export class Fabric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  type: string;

  @Column('simple-array', { nullable: true })
  colors: string[];

  @Column('simple-array', { nullable: true })
  patterns: string[];

  @Column({ nullable: true })
  material: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  width: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  sellerPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  customerPrice: number;

  @ManyToOne(() => User, { eager: true })
  seller: User;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 10 })
  lowStockThreshold: number;

  @Column({ default: true })
  trackInventory: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
