import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/user.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  country: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  designerPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  customerPrice: number;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn()
  designer: User;

  @Column({ default: true })
  isActive: boolean;

  // Keep backward compatibility
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
