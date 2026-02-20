import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
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

  async findById(id: string): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, dto);
    await this.userRepo.save(user);
    return this.sanitize(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false;
    await this.userRepo.save(user);
  }
}

