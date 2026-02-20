import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<Omit<User, 'passwordHash' | 'refreshToken'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, refreshToken, ...result } = user;
    return result;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<Omit<User, 'passwordHash' | 'refreshToken'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (requesterRole !== UserRole.ADMIN && requesterId !== id) {
      throw new ForbiddenException('Access denied');
    }
    Object.assign(user, dto);
    await this.userRepo.save(user);
    const { passwordHash, refreshToken, ...result } = user;
    return result;
  }
}
