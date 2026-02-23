import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('tryon_config')
export class TryOnConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  apiEndpoint: string;

  @Column({ nullable: true })
  apiKey: string;

  @Column({ nullable: true })
  providerName: string;

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  configVariables: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  showcaseImages: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
