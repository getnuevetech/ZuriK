import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  subscribedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, default: 'homepage' })
  source: string;
}
