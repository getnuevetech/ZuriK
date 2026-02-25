import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PromoBannerLocation {
  AFTER_HERO = 'AFTER_HERO',
  AFTER_RTW = 'AFTER_RTW',
  AFTER_FABRICS = 'AFTER_FABRICS',
  AFTER_HOW_IT_WORKS = 'AFTER_HOW_IT_WORKS',
  AFTER_HERITAGE = 'AFTER_HERITAGE',
}

@Entity('promo_banners')
export class PromoBanner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  subtitle: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  ctaText: string;

  @Column({ nullable: true })
  ctaLink: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'enum', enum: PromoBannerLocation, default: PromoBannerLocation.AFTER_FABRICS })
  location: PromoBannerLocation;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
