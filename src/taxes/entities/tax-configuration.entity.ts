import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tax_configurations')
export class TaxConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  state: string;

  @Column()
  taxName: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  baseTaxRate: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  adminMarkupRate: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
