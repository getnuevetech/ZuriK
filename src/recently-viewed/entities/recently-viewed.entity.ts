import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RecentlyViewedItemType {
  DESIGN = 'design',
  READY_TO_WEAR = 'ready_to_wear',
  FABRIC = 'fabric',
}

@Entity('recently_viewed')
@Index(['userId', 'itemId', 'itemType'], { unique: true })
@Index(['userId'])
export class RecentlyViewed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  itemId: string;

  @Column({ type: 'enum', enum: RecentlyViewedItemType, default: RecentlyViewedItemType.DESIGN })
  itemType: RecentlyViewedItemType;

  @CreateDateColumn()
  viewedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
