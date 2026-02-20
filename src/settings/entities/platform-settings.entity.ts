import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum FeeType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
  HYBRID = 'HYBRID',
}

@Entity('platform_settings')
export class PlatformSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'enum', enum: FeeType, default: FeeType.HYBRID })
  platformFeeType: FeeType;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  fixedFee: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  percentageFee: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
