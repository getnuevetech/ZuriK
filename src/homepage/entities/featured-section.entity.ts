import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum SelectionMode {
  MANUAL = 'MANUAL',
  AUTO_NEWEST = 'AUTO_NEWEST',
  AUTO_BEST_SELLING = 'AUTO_BEST_SELLING',
  AUTO_HIGHEST_RATED = 'AUTO_HIGHEST_RATED',
}

@Entity('featured_sections')
export class FeaturedSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'enum', enum: SelectionMode, default: SelectionMode.AUTO_NEWEST })
  selectionMode: SelectionMode;

  @Column({ type: 'jsonb', default: [] })
  manualProductIds: string[];

  @Column({ type: 'int', default: 4 })
  maxRows: number;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
