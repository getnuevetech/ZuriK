import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum DisplayMode {
  PRODUCT_CARDS = 'PRODUCT_CARDS',
  EDITORIAL_BANNER = 'EDITORIAL_BANNER',
}

@Entity('collection_displays')
export class CollectionDisplay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: DisplayMode, default: DisplayMode.PRODUCT_CARDS })
  displayMode: DisplayMode;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'jsonb', nullable: true })
  productIds: string[];

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ nullable: true })
  ctaText: string;

  @Column({ nullable: true })
  ctaLink: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
