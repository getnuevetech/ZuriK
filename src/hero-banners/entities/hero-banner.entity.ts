import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hero_banners')
export class HeroBanner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ nullable: true })
  ctaText: string;

  @Column({ nullable: true })
  ctaLink: string;

  @Column({ default: 'image' })
  mediaType: string;

  @Column()
  mediaUrl: string;

  @Column({ nullable: true })
  mobileMediaUrl: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  textColor: string;

  @Column({ nullable: true, type: 'int' })
  overlayOpacity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
