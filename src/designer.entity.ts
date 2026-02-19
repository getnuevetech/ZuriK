import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('designers')
export class Designer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column()
  specialty: string;

  @Column()
  bio: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
