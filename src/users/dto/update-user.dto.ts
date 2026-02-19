import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../user/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
