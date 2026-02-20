import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

export interface LayoutSection {
  type: string;
  isActive: boolean;
  order: number;
}

export enum SectionType {
  FEATURED_PRODUCTS = 'FEATURED_PRODUCTS',
  COUNTRY_CATEGORIES = 'COUNTRY_CATEGORIES',
  COLLECTIONS = 'COLLECTIONS',
  HERO_BANNER = 'HERO_BANNER',
}

const DEFAULT_SECTIONS: LayoutSection[] = [
  { type: 'HERO_BANNER', isActive: true, order: 1 },
  { type: 'FEATURED_PRODUCTS', isActive: true, order: 2 },
  { type: 'COUNTRY_CATEGORIES', isActive: true, order: 3 },
  { type: 'COLLECTIONS', isActive: true, order: 4 },
  { type: 'NEWSLETTER', isActive: true, order: 5 },
];

@Entity('homepage_layout')
export class HomepageLayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', default: DEFAULT_SECTIONS })
  sections: LayoutSection[];

  @UpdateDateColumn()
  updatedAt: Date;
}
