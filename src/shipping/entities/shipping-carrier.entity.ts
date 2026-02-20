import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ShippingProvider {
  FLAT_RATE = 'FLAT_RATE',
  SHIPPO = 'SHIPPO',
  DHL = 'DHL',
  FEDEX = 'FEDEX',
}

@Entity('shipping_carriers')
export class ShippingCarrier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ShippingProvider })
  provider: ShippingProvider;

  @Column({ type: 'jsonb', nullable: true })
  settings: object;

  @Column({ type: 'simple-array', nullable: true })
  supportedCountries: string[];

  @Column({ type: 'simple-array', nullable: true })
  supportedCurrencies: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
