import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TransitionStyle {
  FADE = 'FADE',
  SLIDE = 'SLIDE',
  CROSSFADE = 'CROSSFADE',
}

export interface HeroImage {
  url: string;
  alt: string;
  caption: string;
}

@Entity('country_heroes')
export class CountryHero {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  countryCode: string;

  @Column()
  countryName: string;

  @Column({ nullable: true })
  flagUrl: string | null;

  @Column({ type: 'jsonb', default: [] })
  heroImages: HeroImage[];

  @Column({ default: 5 })
  rotationInterval: number;

  @Column({ type: 'enum', enum: TransitionStyle, default: TransitionStyle.FADE })
  transitionStyle: TransitionStyle;

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
