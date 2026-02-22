import { IsEmail, IsString, MinLength, IsOptional, IsEnum, Matches, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @ValidateIf((o) => o.fullName !== undefined && o.fullName !== null)
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @ValidateIf((o) => o.firstName !== undefined && o.firstName !== null)
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @ValidateIf((o) => o.lastName !== undefined && o.lastName !== null)
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: [UserRole.CUSTOMER, UserRole.DESIGNER, UserRole.FABRIC_SELLER], default: UserRole.CUSTOMER })
  @IsOptional()
  @IsEnum([UserRole.CUSTOMER, UserRole.DESIGNER, UserRole.FABRIC_SELLER])
  role?: UserRole;
}
