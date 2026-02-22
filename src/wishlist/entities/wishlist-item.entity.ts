import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum WishlistItemType {
  DESIGN = 'design',
  READY_TO_WEAR = 'ready_to_wear',
  FABRIC = 'fabric',
}

@Entity('wishlist_items')
@Index(['userId', 'itemId', 'itemType'], { unique: true })
@Index(['userId'])
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  itemId: string;

  @Column({ type: 'enum', enum: WishlistItemType, default: WishlistItemType.DESIGN })
  itemType: WishlistItemType;

  @CreateDateColumn()
  createdAt: Date;
}
