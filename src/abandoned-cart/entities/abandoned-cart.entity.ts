import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AbandonedCartStatus {
  PENDING = 'pending',
  EMAIL_SENT = 'email_sent',
  RECOVERED = 'recovered',
  EXPIRED = 'expired',
}

@Entity('abandoned_carts')
@Index(['userId', 'status'])
export class AbandonedCart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'jsonb' })
  cartSnapshot: Record<string, any>[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  recoveredAt: Date | null;

  @Column({ type: 'enum', enum: AbandonedCartStatus, default: AbandonedCartStatus.PENDING })
  status: AbandonedCartStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
