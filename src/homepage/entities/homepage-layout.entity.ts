import {
  Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn,
} from 'typeorm';

export enum SectionType {
  FEATURED_PRODUCTS = 'FEATURED_PRODUCTS',
  COUNTRY_CATEGORIES = 'COUNTRY_CATEGORIES',
  COLLECTIONS = 'COLLECTIONS',
  HERO_BANNER = 'HERO_BANNER',
}

@Entity('homepage_layout')
export class HomepageLayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SectionType })
  sectionType: SectionType;

  @Column({ nullable: true })
  sectionId: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
