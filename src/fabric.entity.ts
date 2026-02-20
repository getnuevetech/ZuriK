import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user/user.entity';

@Entity('fabrics')
export class Fabric {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn()
  seller: User;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  width: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  origin: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
