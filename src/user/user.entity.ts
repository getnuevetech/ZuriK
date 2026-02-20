import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DESIGNER = 'DESIGNER',
  FABRIC_SELLER = 'FABRIC_SELLER',
  QA = 'QA',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // QA-specific fields
  @Column({ nullable: true })
  qaFacilityName: string;

  @Column({ nullable: true })
  qaAddressLine1: string;

  @Column({ nullable: true })
  qaCity: string;

  @Column({ nullable: true })
  qaState: string;

  @Column({ nullable: true })
  qaCountry: string;

  @Column({ nullable: true })
  qaPostalCode: string;

  @Column({ nullable: true })
  qaContactPhone: string;

  @Column({ type: 'simple-array', nullable: true })
  qaServesRegions: string[];

  @Column({ nullable: true })
  qaPriority: number;

  @Column({ nullable: true })
  qaCapacity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
