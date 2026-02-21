import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CartItemType {
  READY_TO_WEAR = 'ready-to-wear',
  FABRIC_ONLY = 'fabric-only',
}

@Entity('cart_items')
@Unique(['userId', 'productId', 'fabricId', 'type'])
@Index(['userId'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  productId: string;

  @Column({ nullable: true })
  fabricId: string;

  @Column({ type: 'enum', enum: CartItemType })
  type: CartItemType;

  @Column({ default: 1 })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
