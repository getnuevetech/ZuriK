import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum StockAlertProductType {
  READY_TO_WEAR = 'ready_to_wear',
  FABRIC = 'fabric',
}

export enum StockAlertStatus {
  ACTIVE = 'active',
  NOTIFIED = 'notified',
  CANCELLED = 'cancelled',
}

@Entity('stock_alerts')
@Unique(['userId', 'productId'])
@Index(['productId', 'status'])
export class StockAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  productId: string;

  @Column({ type: 'enum', enum: StockAlertProductType })
  productType: StockAlertProductType;

  @Column({ type: 'timestamp', nullable: true })
  notifiedAt: Date | null;

  @Column({ type: 'enum', enum: StockAlertStatus, default: StockAlertStatus.ACTIVE })
  status: StockAlertStatus;

  @CreateDateColumn()
  createdAt: Date;
}
