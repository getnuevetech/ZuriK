import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('fabrics')
export class Fabric {
  @PrimaryGeneratedColumn()
  id: number;

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
