import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  private sanitize(user: User): Omit<User, 'password' | 'refreshToken'> {
    const { password: _pw, refreshToken: _rt, ...result } = user;
    return result;
  }

  async findAll(): Promise<Omit<User, 'password' | 'refreshToken'>[]> {
    const users = await this.userRepo.find();
    return users.map(u => this.sanitize(u));
  }

  async findById(id: string, requesterId: string, requesterRole: UserRole): Promise<Omit<User, 'password' | 'refreshToken'>> {
    if (requesterId !== id && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: UserRole): Promise<Omit<User, 'password' | 'refreshToken'>> {
    if (requesterId !== id && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, dto);
    await this.userRepo.save(user);
    return this.sanitize(user);
  }

  async remove(id: string, requesterId: string, requesterRole: UserRole): Promise<void> {
    // TODO: Implement GDPR-compliant data purge mechanism.
    // Currently soft-deletes by setting isActive=false.
    // Consider adding a scheduled job to permanently delete inactive users after a retention period.
    if (requesterId !== id && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false;
    await this.userRepo.save(user);
  }
}

