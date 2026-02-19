import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, refreshToken, ...safe } = user;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto, requestingUser: User): Promise<Partial<User>> {
    // Users can only update themselves, admins can update anyone
    if (requestingUser.id !== id && requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    const { passwordHash, refreshToken, ...safe } = saved;
    return safe;
  }
}
