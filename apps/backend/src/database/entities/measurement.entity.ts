import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum MeasurementUnit {
  INCHES = 'inches',
  CENTIMETERS = 'centimeters',
}

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.measurements)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  bust: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  waist: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hips: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  shoulder: number;

  @Column({ name: 'arm_length', type: 'decimal', precision: 5, scale: 2 })
  armLength: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  inseam: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  neck: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  chest: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: MeasurementUnit,
    default: MeasurementUnit.INCHES,
  })
  unit: MeasurementUnit;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ nullable: true })
  label: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
