import { Controller, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, UserRole } from '../user/user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string, @Request() req) {
    const requestingUser: User = req.user;
    // Only allow self or admin
    if (requestingUser.id !== id && requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.update(id, dto, req.user);
  }
}
