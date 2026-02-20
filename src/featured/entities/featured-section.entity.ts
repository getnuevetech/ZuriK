import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SelectionMode {
  MANUAL = 'MANUAL',
  AUTO_NEWEST = 'AUTO_NEWEST',
  AUTO_BESTSELLING = 'AUTO_BESTSELLING',
  AUTO_HIGHEST_RATED = 'AUTO_HIGHEST_RATED',
}

@Entity('featured_sections')
export class FeaturedSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  category: string | null;

  @Column({ type: 'enum', enum: SelectionMode, default: SelectionMode.AUTO_NEWEST })
  selectionMode: SelectionMode;

  @Column({ type: 'jsonb', default: [] })
  manualProductIds: string[];

  @Column({ default: 2 })
  maxRows: number;

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
