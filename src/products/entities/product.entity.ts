import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('products')
export class Product {
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

  @Column()
  country: string;

  @Column('decimal', { precision: 10, scale: 2 })
  designerPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  customerPrice: number;

  @ManyToOne(() => User, { eager: true })
  designer: User;

  @Column({ nullable: true })
  fabricType: string;

  @Column({ nullable: true })
  region: string;

  @Column('simple-array', { nullable: true })
  sizes: string[];

  @Column({ default: true })
  inStock: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column('decimal', { precision: 3, scale: 1, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
