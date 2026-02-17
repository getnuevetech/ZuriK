import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../database/entities/order.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { Design } from '../../database/entities/design.entity';
import { Fabric } from '../../database/entities/fabric.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderSplittingService } from './order-splitting.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Design)
    private readonly designRepository: Repository<Design>,
    @InjectRepository(Fabric)
    private readonly fabricRepository: Repository<Fabric>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly orderSplittingService: OrderSplittingService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const { items, shippingAddress, paymentMethod, notes } = createOrderDto;

    const enrichedItems = await this.enrichOrderItems(items);
    const subtotal = this.calculateSubtotal(enrichedItems);
    const { platformFee, shippingFee } = this.calculateFees(subtotal);
    const totalAmount = subtotal + platformFee + shippingFee;

    const orderNumber = this.generateOrderNumber();

    const orderSplits = await this.orderSplittingService.calculateOrderSplits(
      enrichedItems,
      platformFee,
    );

    const order = this.orderRepository.create({
      orderNumber,
      userId: user.id,
      items: enrichedItems,
      subtotal,
      platformFee,
      shippingFee,
      totalAmount,
      status: OrderStatus.PENDING,
      shippingAddress,
      paymentMethod,
      notes,
      orderSplits,
    });

    return this.orderRepository.save(order);
  }

  async findUserOrders(userId: string, status?: OrderStatus): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId });

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    query.orderBy('order.createdAt', 'DESC');

    return query.getMany();
  }

  async findOne(id: string, user: User): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus, user: User): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role !== UserRole.ADMIN) {
      const canUpdate = await this.canUserUpdateOrder(order, user);
      if (!canUpdate) {
        throw new ForbiddenException('You do not have permission to update this order');
      }
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  private async enrichOrderItems(items: any[]): Promise<any[]> {
    const enrichedItems = [];

    for (const item of items) {
      if (item.type === 'design') {
        const design = await this.designRepository.findOne({
          where: { id: item.itemId },
          relations: ['designer'],
        });

        if (!design) {
          throw new BadRequestException(`Design with ID ${item.itemId} not found`);
        }

        enrichedItems.push({
          type: 'design',
          itemId: design.id,
          name: design.name,
          price: Number(design.price),
          quantity: item.quantity,
          sellerId: design.designerId,
          sellerName: `${design.designer.firstName} ${design.designer.lastName}`,
          image: design.images[0],
        });
      } else if (item.type === 'fabric') {
        const fabric = await this.fabricRepository.findOne({
          where: { id: item.itemId },
          relations: ['seller'],
        });

        if (!fabric) {
          throw new BadRequestException(`Fabric with ID ${item.itemId} not found`);
        }

        if (fabric.stockQuantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for fabric: ${fabric.name}`);
        }

        enrichedItems.push({
          type: 'fabric',
          itemId: fabric.id,
          name: fabric.name,
          price: Number(fabric.pricePerMeter),
          quantity: item.quantity,
          sellerId: fabric.sellerId,
          sellerName: `${fabric.seller.firstName} ${fabric.seller.lastName}`,
          image: fabric.images[0],
        });

        fabric.stockQuantity -= item.quantity;
        await this.fabricRepository.save(fabric);
      }
    }

    return enrichedItems;
  }

  private calculateSubtotal(items: any[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private calculateFees(subtotal: number): { platformFee: number; shippingFee: number } {
    const platformFeePercentage = Number(process.env.PLATFORM_FEE_PERCENTAGE) || 10;
    const platformFee = (subtotal * platformFeePercentage) / 100;
    const shippingFee = 15;

    return { platformFee, shippingFee };
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
  }

  private async canUserUpdateOrder(order: Order, user: User): Promise<boolean> {
    for (const item of order.items) {
      if (item.sellerId === user.id) {
        return true;
      }
    }
    return false;
  }
}
