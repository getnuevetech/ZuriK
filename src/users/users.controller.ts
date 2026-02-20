import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.types';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../user/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  getUser(@Param('id') id: string, @Request() req: RequestWithUser) {
    const { id: requesterId, role } = req.user;
    if (role !== UserRole.ADMIN && requesterId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findById(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: RequestWithUser,
  ) {
    const { id: requesterId, role } = req.user;
    return this.usersService.update(id, dto, requesterId, role);
  }
}
