import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  CUSTOMER = 'customer',
  DESIGNER = 'designer',
  FABRIC_SELLER = 'fabric_seller',
  QA = 'qa',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ type: 'enum', enum: ['local', 'google'], default: 'local' })
  provider: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Exclude()
  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Exclude()
  @Column({ nullable: true, type: 'varchar' })
  emailVerificationToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationExpires: Date | null;

  @Exclude()
  @Column({ nullable: true, type: 'varchar' })
  passwordResetToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpires: Date | null;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true, type: 'timestamp' })
  lockedUntil: Date | null;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ default: 0 })
  loyaltyPoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
