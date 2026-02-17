import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { Order, OrderStatus } from '../../database/entities/order.entity';
import { Design } from '../../database/entities/design.entity';
import { Fabric } from '../../database/entities/fabric.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Design)
    private readonly designRepository: Repository<Design>,
    @InjectRepository(Fabric)
    private readonly fabricRepository: Repository<Fabric>,
  ) {}

  async getAllOrders(status?: OrderStatus): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      query.where('order.status = :status', { status });
    }

    return query.getMany();
  }

  async getAllUsers(role?: UserRole): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');

    if (role) {
      query.where('user.role = :role', { role });
    }

    query.select([
      'user.id',
      'user.email',
      'user.username',
      'user.firstName',
      'user.lastName',
      'user.role',
      'user.country',
      'user.isActive',
      'user.emailVerified',
      'user.createdAt',
    ]);

    query.orderBy('user.createdAt', 'DESC');

    return query.getMany();
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async getStatistics() {
    const [
      totalUsers,
      totalOrders,
      totalDesigns,
      totalFabrics,
      pendingOrders,
      totalRevenue,
    ] = await Promise.all([
      this.userRepository.count(),
      this.orderRepository.count(),
      this.designRepository.count({ where: { isActive: true } }),
      this.fabricRepository.count({ where: { isActive: true } }),
      this.orderRepository.count({ where: { status: OrderStatus.PENDING } }),
      this.calculateTotalRevenue(),
    ]);

    const usersByRole = await this.getUserCountByRole();

    return {
      totalUsers,
      totalOrders,
      totalDesigns,
      totalFabrics,
      pendingOrders,
      totalRevenue,
      usersByRole,
    };
  }

  private async calculateTotalRevenue(): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.status != :status', { status: OrderStatus.CANCELLED })
      .getRawOne();

    return Number(result?.total || 0);
  }

  private async getUserCountByRole() {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const counts: any = {};
    result.forEach((item) => {
      counts[item.role] = Number(item.count);
    });

    return counts;
  }
}
