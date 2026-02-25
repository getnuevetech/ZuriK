import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('shop_by_country_settings')
export class ShopByCountrySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 4000 })
  scrollSpeed: number;

  @Column({ type: 'varchar', default: '6/5' })
  aspectRatio: string;

  @Column({ default: true })
  autoScrollEnabled: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
