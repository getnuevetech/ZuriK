import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LoyaltyTransactionType {
  EARNED_PURCHASE = 'earned_purchase',
  EARNED_REVIEW = 'earned_review',
  EARNED_REFERRAL = 'earned_referral',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ADJUSTMENT = 'adjustment',
}

@Entity('loyalty_transactions')
@Index(['userId', 'createdAt'])
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'enum', enum: LoyaltyTransactionType })
  type: LoyaltyTransactionType;

  @Column()
  description: string;

  @Column({ type: 'varchar', nullable: true })
  referenceId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
