import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { OrderStatus } from '../../database/entities/order.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiResponse({ status: 200, description: 'Orders retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllOrders(@Query('status') status?: OrderStatus) {
    const orders = await this.adminService.getAllOrders(status);
    return { orders, count: orders.length };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllUsers(@Query('role') role?: UserRole) {
    const users = await this.adminService.getAllUsers(role);
    return { users, count: users.length };
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    const user = await this.adminService.updateUserRole(id, role);
    return {
      message: 'User role updated successfully',
      user,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get platform statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getStatistics() {
    const statistics = await this.adminService.getStatistics();
    return { statistics };
  }
}
