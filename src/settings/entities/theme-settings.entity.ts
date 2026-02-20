import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

export enum ThemeName {
  BOLD_VIBRANT_AFRICAN = 'BOLD_VIBRANT_AFRICAN',
  WARM_EARTHY_LUXE = 'WARM_EARTHY_LUXE',
  MODERN_PUNCHY = 'MODERN_PUNCHY',
}

@Entity('theme_settings')
export class ThemeSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ThemeName, default: ThemeName.BOLD_VIBRANT_AFRICAN })
  activeTheme: ThemeName;

  @Column({ type: 'jsonb', nullable: true })
  customColors: Record<string, string> | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
