import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DisplayMode {
  PRODUCT_CARDS = 'PRODUCT_CARDS',
  EDITORIAL_BANNER = 'EDITORIAL_BANNER',
}

@Entity('collection_displays')
export class CollectionDisplay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  collectionName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: DisplayMode, default: DisplayMode.PRODUCT_CARDS })
  displayMode: DisplayMode;

  @Column({ nullable: true })
  editorialImage: string | null;

  @Column({ nullable: true })
  editorialOverlayText: string | null;

  @Column({ type: 'jsonb', default: [] })
  productIds: string[];

  @Column({ nullable: true })
  category: string | null;

  @Column({ default: 8 })
  maxProducts: number;

  @Index()
  @Column({ default: 0 })
  displayOrder: number;

  @Index()
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
