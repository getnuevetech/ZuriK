import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SellerApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum RequestedRole {
  DESIGNER = 'designer',
  FABRIC_SELLER = 'fabric_seller',
}

@Entity('seller_applications')
export class SellerApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'applicantId' })
  applicant: User;

  @Column()
  applicantId: string;

  @Column({ type: 'enum', enum: RequestedRole })
  requestedRole: RequestedRole;

  @Column({ type: 'enum', enum: SellerApplicationStatus, default: SellerApplicationStatus.PENDING })
  status: SellerApplicationStatus;

  @Column()
  businessName: string;

  @Column({ type: 'text' })
  businessDescription: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: User;

  @Column({ nullable: true })
  reviewedById: string;

  @Column({ nullable: true, type: 'timestamp' })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
