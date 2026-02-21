import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Coupon } from './coupon.entity';
import { User } from '../../users/entities/user.entity';

@Entity('coupon_usages')
export class CouponUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;

  @Column()
  couponId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountApplied: number;

  @CreateDateColumn()
  usedAt: Date;
}
