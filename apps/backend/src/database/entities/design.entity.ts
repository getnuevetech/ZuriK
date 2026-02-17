import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Fabric } from './fabric.entity';

export enum DesignCategory {
  DRESS = 'dress',
  SUIT = 'suit',
  TRADITIONAL = 'traditional',
  CASUAL = 'casual',
  FORMAL = 'formal',
  WEDDING = 'wedding',
  AGBADA = 'agbada',
  KAFTAN = 'kaftan',
  DASHIKI = 'dashiki',
  WRAPPER = 'wrapper',
  OTHER = 'other',
}

@Entity('designs')
export class Design {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'simple-array' })
  images: string[];

  @Column({
    type: 'enum',
    enum: DesignCategory,
  })
  category: DesignCategory;

  @Column({ name: 'designer_id' })
  designerId: string;

  @ManyToOne(() => User, (user) => user.designs)
  @JoinColumn({ name: 'designer_id' })
  designer: User;

  @ManyToMany(() => Fabric)
  @JoinTable({
    name: 'design_compatible_fabrics',
    joinColumn: { name: 'design_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'fabric_id', referencedColumnName: 'id' },
  })
  compatibleFabrics: Fabric[];

  @Column()
  country: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'review_count', type: 'integer', default: 0 })
  reviewCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'difficulty_level', nullable: true })
  difficultyLevel: string;

  @Column({ name: 'estimated_time_days', type: 'integer', nullable: true })
  estimatedTimeDays: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
