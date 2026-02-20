import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/user.entity';

@Entity('fabrics')
export class Fabric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'simple-array', nullable: true })
  colors: string[];

  @Column({ type: 'simple-array', nullable: true })
  patterns: string[];

  @Column({ nullable: true })
  material: string;

  @Column({ nullable: true })
  width: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  origin: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sellerPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  customerPrice: number;

  // Keep backward compatibility
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn()
  seller: User;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
