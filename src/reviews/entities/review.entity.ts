import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ReviewItemType {
  DESIGN = 'design',
  READY_TO_WEAR = 'ready_to_wear',
  FABRIC = 'fabric',
}

@Entity('reviews')
@Unique(['userId', 'itemId', 'itemType'])
@Index(['itemId', 'itemType', 'status', 'createdAt'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  itemId: string;

  @Column({ type: 'enum', enum: ReviewItemType, default: ReviewItemType.DESIGN })
  itemType: ReviewItemType;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ default: false })
  isVerifiedPurchase: boolean;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @Column({ type: 'text', nullable: true })
  adminNote: string | null;

  @Column({ default: 0 })
  helpfulCount: number;

  @Column({ type: 'jsonb', default: [] })
  helpfulBy: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
