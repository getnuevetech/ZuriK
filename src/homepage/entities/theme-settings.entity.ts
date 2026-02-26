import {
  Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn,
} from 'typeorm';

export enum ThemeKey {
  BOLD_VIBRANT = 'BOLD_VIBRANT',
  WARM_EARTHY = 'WARM_EARTHY',
  MODERN_PUNCHY = 'MODERN_PUNCHY',
  MUEBLE_MODERN = 'MUEBLE_MODERN',
}

@Entity('theme_settings')
export class ThemeSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ThemeKey, default: ThemeKey.BOLD_VIBRANT })
  activeTheme: ThemeKey;

  @Column({ type: 'jsonb', nullable: true })
  customOverrides: Record<string, string>;

  @UpdateDateColumn()
  updatedAt: Date;
}
