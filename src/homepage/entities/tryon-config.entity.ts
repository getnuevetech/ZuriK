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

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  configVariables: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
