import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  customer: User;

  @Column('decimal', { precision: 5, scale: 2 })
  chest: number;

  @Column('decimal', { precision: 5, scale: 2 })
  waist: number;

  @Column('decimal', { precision: 5, scale: 2 })
  hips: number;

  @Column('decimal', { precision: 5, scale: 2 })
  shoulder: number;

  @Column('decimal', { precision: 5, scale: 2 })
  sleeveLength: number;

  @Column('decimal', { precision: 5, scale: 2 })
  length: number;

  @Column({
    type: 'enum',
    enum: ['CM', 'INCHES'],
    default: 'CM',
  })
  unit: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
