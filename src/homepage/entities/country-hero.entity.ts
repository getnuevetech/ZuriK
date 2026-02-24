import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('country_heroes')
export class CountryHero {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  countryName: string;

  @Column()
  countryCode: string;

  @Column({ type: 'jsonb', default: [] })
  heroImages: string[];

  @Column({ nullable: true })
  flag: string;

  @Column({ type: 'jsonb', default: [] })
  fabrics: string[];

  @Column({ nullable: true })
  subtitle: string;

  @Column({ type: 'int', default: 5000 })
  rotationInterval: number;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
