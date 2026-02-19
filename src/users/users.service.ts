import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { User, UserRole } from '../user/user.entity';

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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto, requestingUser: User) {
    const user = await this.findById(id);

    if (requestingUser.id !== id && requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.role && requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can change roles');
    }

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.country) user.country = dto.country;
    if (dto.role && requestingUser.role === UserRole.ADMIN) user.role = dto.role;

    return this.userRepository.save(user);
  }
}
