import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Order, OrderStatus, OrderType } from '../orders/entities/order.entity';
import { DesignerOrder } from '../orders/entities/designer-order.entity';
import { FabricSellerOrder } from '../orders/entities/fabric-seller-order.entity';
import { AdminCreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(DesignerOrder)
    private readonly designerOrderRepository: Repository<DesignerOrder>,
    @InjectRepository(FabricSellerOrder)
    private readonly fabricSellerOrderRepository: Repository<FabricSellerOrder>,
  ) {}

  private sanitizeUser(user: User): Omit<User, 'password' | 'refreshToken'> {
    const { password, refreshToken, ...sanitized } = user as any;
    return sanitized;
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  async getOverview() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalOrders, last30DaysOrders] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { createdAt: Between(thirtyDaysAgo, now) } as any }),
    ]);

    const revenueStatuses = [
      OrderStatus.PAID,
      OrderStatus.DELIVERED,
      OrderStatus.QA_APPROVED,
      OrderStatus.SHIPPED_TO_CUSTOMER,
    ];
    const revenueOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .where('order.status IN (:...statuses)', { statuses: revenueStatuses })
      .getRawOne();

    const users = await this.userRepository.find();
    const usersByRole: Record<string, number> = {};
    for (const role of Object.values(UserRole)) {
      usersByRole[role] = users.filter((u) => u.role === role).length;
    }

    const pendingOrdersCount = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING_PAYMENT },
    });

    const allOrders = await this.orderRepository.find();
    const ordersByStatus: Record<string, number> = {};
    for (const status of Object.values(OrderStatus)) {
      ordersByStatus[status] = allOrders.filter((o) => o.status === status).length;
    }

    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    const monthlyOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.createdAt', 'createdAt')
      .addSelect('order.totalPrice', 'totalPrice')
      .addSelect('order.status', 'status')
      .where('order.createdAt >= :start', { start: twelveMonthsAgo })
      .getRawMany();

    const revenueByMonthMap: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonthMap[key] = 0;
    }
    for (const row of monthlyOrders) {
      if (revenueStatuses.includes(row.status)) {
        const d = new Date(row.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in revenueByMonthMap) {
          revenueByMonthMap[key] += parseFloat(row.totalPrice) || 0;
        }
      }
    }
    const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return {
      totalOrders: { allTime: totalOrders, last30Days: last30DaysOrders },
      totalRevenue: parseFloat(revenueOrders?.total) || 0,
      usersByRole,
      pendingOrdersCount,
      ordersByStatus,
      revenueByMonth,
    };
  }

  async getRevenueAnalytics() {
    const revenueStatuses = [
      OrderStatus.PAID,
      OrderStatus.DELIVERED,
      OrderStatus.QA_APPROVED,
      OrderStatus.SHIPPED_TO_CUSTOMER,
    ];

    const allOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'order.orderType',
        'order.totalPrice',
        'order.platformFee',
        'order.designerEarnings',
        'order.fabricSellerEarnings',
        'order.status',
        'order.createdAt',
      ])
      .getMany();

    const revenueOrders = allOrders.filter((o) => revenueStatuses.includes(o.status));

    const revenueByOrderType: Record<string, number> = {
      [OrderType.CUSTOM_DESIGN]: 0,
      [OrderType.READY_TO_WEAR]: 0,
      [OrderType.FABRIC_ONLY]: 0,
    };
    for (const o of revenueOrders) {
      revenueByOrderType[o.orderType] = (revenueByOrderType[o.orderType] || 0) + (parseFloat(o.totalPrice as any) || 0);
    }

    const platformFeesCollected = revenueOrders.reduce(
      (sum, o) => sum + (parseFloat(o.platformFee as any) || 0),
      0,
    );
    const designerEarningsTotal = revenueOrders.reduce(
      (sum, o) => sum + (parseFloat(o.designerEarnings as any) || 0),
      0,
    );
    const fabricSellerEarningsTotal = revenueOrders.reduce(
      (sum, o) => sum + (parseFloat(o.fabricSellerEarnings as any) || 0),
      0,
    );

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const revenueTrendMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      revenueTrendMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of revenueOrders) {
      const d = new Date(o.createdAt);
      if (d >= thirtyDaysAgo) {
        const key = d.toISOString().slice(0, 10);
        if (key in revenueTrendMap) {
          revenueTrendMap[key] += parseFloat(o.totalPrice as any) || 0;
        }
      }
    }
    const revenueTrend = Object.entries(revenueTrendMap).map(([date, revenue]) => ({ date, revenue }));

    return {
      revenueByOrderType,
      platformFeesCollected,
      designerEarningsTotal,
      fabricSellerEarningsTotal,
      revenueTrend,
    };
  }

  async getOrderAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select(['order.createdAt', 'order.status', 'order.totalPrice'])
      .where('order.createdAt >= :start', { start: thirtyDaysAgo })
      .getMany();

    const ordersPerDayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      ordersPerDayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of recentOrders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (key in ordersPerDayMap) ordersPerDayMap[key]++;
    }
    const ordersPerDay = Object.entries(ordersPerDayMap).map(([date, count]) => ({ date, count }));

    const avgResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('AVG(order.totalPrice)', 'avg')
      .getRawOne();
    const averageOrderValue = parseFloat(avgResult?.avg) || 0;

    const allOrders = await this.orderRepository.find();
    const ordersByStatus: Record<string, number> = {};
    for (const status of Object.values(OrderStatus)) {
      ordersByStatus[status] = allOrders.filter((o) => o.status === status).length;
    }

    const designerOrders = await this.designerOrderRepository
      .createQueryBuilder('do')
      .leftJoin('do.designer', 'designer')
      .select(['designer.id', 'designer.firstName', 'designer.lastName'])
      .addSelect('COUNT(do.id)', 'orderCount')
      .groupBy('designer.id')
      .orderBy('orderCount', 'DESC')
      .limit(5)
      .getRawMany();

    const topDesigners = designerOrders.map((row) => ({
      designerId: row.designer_id,
      name: `${row.designer_firstName || ''} ${row.designer_lastName || ''}`.trim(),
      orderCount: parseInt(row.orderCount, 10),
    }));

    const fabricOrders = await this.fabricSellerOrderRepository
      .createQueryBuilder('fso')
      .leftJoin('fso.fabric', 'fabric')
      .select('fabric.id', 'fabricId')
      .addSelect('COUNT(fso.id)', 'orderCount')
      .groupBy('fabric.id')
      .orderBy('orderCount', 'DESC')
      .limit(5)
      .getRawMany();

    const topFabrics = fabricOrders.map((row) => ({
      fabricId: row.fabricId,
      orderCount: parseInt(row.orderCount, 10),
    }));

    return { ordersPerDay, averageOrderValue, ordersByStatus, topDesigners, topFabrics };
  }

  async getUserAnalytics() {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const users = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.role', 'user.createdAt'])
      .where('user.createdAt >= :start', { start: twelveMonthsAgo })
      .getMany();

    const newUsersPerMonthMap: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      newUsersPerMonthMap[key] = 0;
    }
    for (const u of users) {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in newUsersPerMonthMap) newUsersPerMonthMap[key]++;
    }
    const newUsersPerMonth = Object.entries(newUsersPerMonthMap).map(([month, count]) => ({ month, count }));

    const allUsers = await this.userRepository.find();
    const usersByRole: Record<string, number> = {};
    for (const role of Object.values(UserRole)) {
      usersByRole[role] = allUsers.filter((u) => u.role === role).length;
    }

    const customerOrderCounts = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.customer', 'customer')
      .select('customer.id', 'customerId')
      .addSelect('customer.firstName', 'firstName')
      .addSelect('customer.lastName', 'lastName')
      .addSelect('customer.email', 'email')
      .addSelect('COUNT(order.id)', 'orderCount')
      .where('customer.role = :role', { role: UserRole.CUSTOMER })
      .groupBy('customer.id')
      .orderBy('orderCount', 'DESC')
      .limit(5)
      .getRawMany();

    const mostActiveCustomers = customerOrderCounts.map((row) => ({
      id: row.customerId,
      name: `${row.firstName || ''} ${row.lastName || ''}`.trim(),
      email: row.email,
      orderCount: parseInt(row.orderCount, 10),
    }));

    return { newUsersPerMonth, usersByRole, mostActiveCustomers };
  }

  // ─── User Management ──────────────────────────────────────────────────────

  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sort?: string;
  }) {
    const { page = 1, limit = 20, search, role, sort } = params;
    const skip = (page - 1) * limit;

    const qb = this.userRepository.createQueryBuilder('user');

    if (search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    const ALLOWED_USER_SORT_FIELDS = ['createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'role'];
    const [rawSortField, sortDir] = (sort || 'createdAt:DESC').split(':');
    const sortField = ALLOWED_USER_SORT_FIELDS.includes(rawSortField) ? rawSortField : 'createdAt';
    qb.orderBy(`user.${sortField}`, (sortDir?.toUpperCase() as 'ASC' | 'DESC') || 'DESC');

    qb.skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users.map((u) => this.sanitizeUser(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    const orderCount = await this.orderRepository.count({
      where: { customer: { id } } as any,
    });

    return { ...this.sanitizeUser(user), orderCount };
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.role = role;
    const saved = await this.userRepository.save(user);
    return this.sanitizeUser(saved);
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.isActive = isActive;
    const saved = await this.userRepository.save(user);
    return this.sanitizeUser(saved);
  }

  async createUser(dto: AdminCreateUserDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: hashedPassword,
      role: dto.role,
      isEmailVerified: true,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
    const saved = await this.userRepository.save(user);
    return this.sanitizeUser(saved);
  }

  async getPendingApprovals() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role IN (:...roles)', { roles: [UserRole.DESIGNER, UserRole.FABRIC_SELLER] })
      .andWhere('user.isActive = false')
      .getMany();
    return users.map((u) => this.sanitizeUser(u));
  }

  // ─── Order Management ─────────────────────────────────────────────────────

  async listOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    orderType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
  }) {
    const { page = 1, limit = 20, status, orderType, search, startDate, endDate, sort } = params;
    const skip = (page - 1) * limit;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer');

    if (search) {
      qb.andWhere('order.orderNumber ILIKE :search', { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    if (orderType) {
      qb.andWhere('order.orderType = :orderType', { orderType });
    }
    if (startDate && endDate) {
      qb.andWhere('order.createdAt BETWEEN :start AND :end', {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    } else if (startDate) {
      qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
    } else if (endDate) {
      qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
    }

    const ALLOWED_ORDER_SORT_FIELDS = ['createdAt', 'updatedAt', 'totalPrice', 'orderNumber', 'status', 'orderType'];
    const [rawSortField, sortDir] = (sort || 'createdAt:DESC').split(':');
    const sortField = ALLOWED_ORDER_SORT_FIELDS.includes(rawSortField) ? rawSortField : 'createdAt';
    qb.orderBy(`order.${sortField}`, (sortDir?.toUpperCase() as 'ASC' | 'DESC') || 'DESC');

    qb.skip(skip).take(limit);

    const [orders, total] = await qb.getManyAndCount();

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'design', 'fabric', 'measurement'],
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const designerOrder = await this.designerOrderRepository.findOne({
      where: { order: { id } } as any,
      relations: ['designer', 'design', 'measurement'],
    });

    const fabricSellerOrder = await this.fabricSellerOrderRepository.findOne({
      where: { order: { id } } as any,
      relations: ['fabricSeller', 'fabric'],
    });

    return { ...order, designerOrder: designerOrder || null, fabricSellerOrder: fabricSellerOrder || null };
  }

  async updateOrderStatus(id: string, status: OrderStatus, reason?: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    order.status = status;
    if (reason) {
      order.qaComments = reason;
    }
    return this.orderRepository.save(order);
  }

  async refundOrder(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}
