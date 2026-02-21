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

export enum ReviewPromptStatus {
  PENDING = 'pending',
  EMAIL_SENT = 'email_sent',
  REVIEWED = 'reviewed',
  DISMISSED = 'dismissed',
}

@Entity('review_prompts')
@Index(['userId', 'productId', 'status'])
export class ReviewPrompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  orderId: string;

  @Column()
  productId: string;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'enum', enum: ReviewPromptStatus, default: ReviewPromptStatus.PENDING })
  status: ReviewPromptStatus;

  @CreateDateColumn()
  createdAt: Date;
}
