import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('ready_to_wear_products')
export class ReadyToWearProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('decimal', { precision: 10, scale: 2 })
  designerPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  customerPrice: number;

  @ManyToOne(() => User, { eager: true })
  designer: User;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 5 })
  lowStockThreshold: number;

  @Column({ default: false })
  trackInventory: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column('decimal', { precision: 3, scale: 1, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
