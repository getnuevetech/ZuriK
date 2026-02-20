import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../product.entity';
import { Fabric } from '../fabric.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { UserRole } from '../user/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Fabric)
    private readonly fabricRepo: Repository<Fabric>,
    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<Order> {
    const design = await this.productRepo.findOne({ where: { id: Number(dto.designId) } });
    if (!design) {
      throw new NotFoundException(`Design ${dto.designId} not found`);
    }

    const fabric = await this.fabricRepo.findOne({ where: { id: Number(dto.fabricId) } });
    if (!fabric) {
      throw new NotFoundException(`Fabric ${dto.fabricId} not found`);
    }

    const totalPrice = Number(design.price) + Number(fabric.price);
    const designerEarnings = totalPrice * 0.6;
    const fabricSellerEarnings = totalPrice * 0.3;
    const platformFee = totalPrice * 0.1;

    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const uniquePart = `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`.toUpperCase().substr(-6);
    const orderNumber = `ORD-${datePart}-${uniquePart}`;

    const measurement = await this.measurementRepo.save(
      this.measurementRepo.create({
        customer: { id: customerId },
        ...dto.measurements,
      }),
    );

    const order = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber,
        customer: { id: customerId },
        design,
        fabric,
        designPrice: design.price,
        fabricPrice: fabric.price,
        totalPrice,
        designerEarnings,
        fabricSellerEarnings,
        platformFee,
        measurements: measurement,
        customerNotes: dto.customerNotes,
        status: 'PENDING',
      }),
    );

    return order;
  }

  async getOrdersForUser(userId: string, userRole: UserRole): Promise<Partial<Order>[]> {
    switch (userRole) {
      case UserRole.CUSTOMER:
        return this.orderRepo.find({
          where: { customer: { id: userId } },
          relations: ['design', 'fabric', 'measurements'],
        });

      case UserRole.DESIGNER: {
        const designerProducts = await this.productRepo.find({
          where: { designer: { id: userId } },
        });
        if (!designerProducts.length) return [];
        return this.orderRepo.find({
          where: { design: { id: In(designerProducts.map((p) => p.id)) } },
          relations: ['design', 'measurements'],
        });
      }

      case UserRole.FABRIC_SELLER: {
        const sellerFabrics = await this.fabricRepo.find({
          where: { seller: { id: userId } },
        });
        if (!sellerFabrics.length) return [];
        return this.orderRepo.find({
          where: { fabric: { id: In(sellerFabrics.map((f) => f.id)) } },
          relations: ['fabric', 'measurements'],
        });
      }

      case UserRole.ADMIN:
        return this.orderRepo.find({
          relations: ['customer', 'design', 'fabric', 'measurements'],
        });

      default:
        throw new ForbiddenException('Invalid role');
    }
  }

  async getOrderById(
    orderId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Partial<Order>> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'design', 'fabric', 'measurements'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Customers can only view their own orders
    if (userRole === UserRole.CUSTOMER && order.customer.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.filterOrderByRole(order, userRole);
  }

  private filterOrderByRole(order: Order, role: UserRole): Partial<Order> {
    switch (role) {
      case UserRole.DESIGNER:
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          design: order.design,
          designPrice: order.designPrice,
          designerEarnings: order.designerEarnings,
          status: order.status,
          measurements: order.measurements,
          createdAt: order.createdAt,
        };

      case UserRole.FABRIC_SELLER:
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          fabric: order.fabric,
          fabricPrice: order.fabricPrice,
          fabricSellerEarnings: order.fabricSellerEarnings,
          status: order.status,
          measurements: order.measurements,
          createdAt: order.createdAt,
        };

      case UserRole.ADMIN:
        return order;

      case UserRole.CUSTOMER:
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          customer: order.customer,
          design: order.design,
          fabric: order.fabric,
          designPrice: order.designPrice,
          fabricPrice: order.fabricPrice,
          totalPrice: order.totalPrice,
          status: order.status,
          measurements: order.measurements,
          customerNotes: order.customerNotes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };

      default:
        throw new ForbiddenException('Access denied');
    }
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const { status } = dto;

    if (status === 'CONFIRMED' || status === 'CANCELLED') {
      if (userRole !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can confirm or cancel orders');
      }
    }

    if (status === 'IN_PRODUCTION') {
      if (userRole !== UserRole.DESIGNER) {
        throw new ForbiddenException('Only designers can mark orders as in production');
      }
    }

    if (status === 'SHIPPED') {
      if (userRole !== UserRole.FABRIC_SELLER && userRole !== UserRole.ADMIN) {
        throw new ForbiddenException('Only fabric sellers or admins can mark orders as shipped');
      }
    }

    order.status = status;
    return this.orderRepo.save(order);
  }
}
