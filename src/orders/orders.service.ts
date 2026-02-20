import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { UserRole, User } from '../user/user.entity';
import { Product } from '../products/entities/product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CalculateOrderDto } from './dto/calculate-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { TaxesService } from '../taxes/taxes.service';

// Designer/seller payout ratio
const PAYOUT_RATIO = 0.9;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Fabric)
    private readonly fabricRepo: Repository<Fabric>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
    private readonly taxesService: TaxesService,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const uniquePart = `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`.toUpperCase().substr(-6);
    return `ORD-${datePart}-${uniquePart}`;
  }

  async calculateOrder(dto: CalculateOrderDto): Promise<object> {
    const product = await this.productRepo.findOne({ where: { id: dto.designId } });
    const fabric = await this.fabricRepo.findOne({ where: { id: dto.fabricId } });

    if (!product) throw new NotFoundException(`Design ${dto.designId} not found`);
    if (!fabric) throw new NotFoundException(`Fabric ${dto.fabricId} not found`);

    const designPrice = Number(product.customerPrice || product.price || 0);
    const fabricPrice = Number(fabric.customerPrice || fabric.price || 0);
    const subtotal = designPrice + fabricPrice;

    const settings = await this.settingsService.findActive();
    const platformFee = settings ? this.settingsService.calculateFee(designPrice, fabricPrice, settings) : 0;

    const country = dto.country || 'Nigeria';
    const taxPreview = await this.taxesService.previewTax(subtotal + platformFee, country) as any;
    const taxAmount = taxPreview.taxAmount || 0;
    const taxRate = taxPreview.totalTaxRate || 0;

    const shippingCost = 0;
    const totalAmount = subtotal + platformFee + taxAmount + shippingCost;
    const designerPayout = designPrice * PAYOUT_RATIO;
    const fabricSellerPayout = fabricPrice * PAYOUT_RATIO;
    const platformRevenue = platformFee + (designPrice * (1 - PAYOUT_RATIO)) + (fabricPrice * (1 - PAYOUT_RATIO));

    return {
      designPrice,
      fabricPrice,
      subtotal,
      platformFee,
      taxAmount,
      taxRate,
      shippingCost,
      totalAmount,
      designerPayout,
      fabricSellerPayout,
      platformRevenue,
    };
  }

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<Order> {
    const product = await this.productRepo.findOne({
      where: { id: dto.designId },
      relations: ['designer'],
    });
    if (!product) throw new NotFoundException(`Design ${dto.designId} not found`);

    const fabric = await this.fabricRepo.findOne({
      where: { id: dto.fabricId },
      relations: ['seller'],
    });
    if (!fabric) throw new NotFoundException(`Fabric ${dto.fabricId} not found`);

    const designPrice = Number(product.customerPrice || product.price || 0);
    const fabricPrice = Number(fabric.customerPrice || fabric.price || 0);
    const subtotal = designPrice + fabricPrice;

    const settings = await this.settingsService.findActive();
    const platformFee = settings ? this.settingsService.calculateFee(designPrice, fabricPrice, settings) : 0;

    const country = dto.country || 'Nigeria';
    const taxPreview = await this.taxesService.previewTax(subtotal + platformFee, country) as any;
    const taxAmount = taxPreview.taxAmount || 0;
    const taxRate = taxPreview.totalTaxRate || 0;

    const shippingCost = 0;
    const totalAmount = subtotal + platformFee + taxAmount + shippingCost;
    const designerPayout = designPrice * PAYOUT_RATIO;
    const fabricSellerPayout = fabricPrice * PAYOUT_RATIO;
    const platformRevenue = platformFee + (designPrice * (1 - PAYOUT_RATIO)) + (fabricPrice * (1 - PAYOUT_RATIO));

    // Find available QA
    const qaUser = await this.userRepo.findOne({
      where: { role: UserRole.QA, isActive: true },
    });

    const order = await this.orderRepo.save(this.orderRepo.create({
      orderNumber: this.generateOrderNumber(),
      customer: { id: customerId },
      design: { id: dto.designId },
      fabric: { id: dto.fabricId },
      measurement: dto.measurementId ? { id: dto.measurementId } : undefined,
      qaAssignee: qaUser || undefined,
      designPrice,
      fabricPrice,
      subtotal,
      platformFee,
      taxAmount,
      taxRate,
      shippingCost,
      totalAmount,
      totalPrice: totalAmount,
      designerPayout,
      fabricSellerPayout,
      platformRevenue,
      designerEarnings: designerPayout,
      fabricSellerEarnings: fabricSellerPayout,
      shippingAddress: dto.shippingAddress,
      qaAddress: qaUser ? {
        facilityName: qaUser.qaFacilityName,
        addressLine1: qaUser.qaAddressLine1,
        city: qaUser.qaCity,
        state: qaUser.qaState,
        country: qaUser.qaCountry,
        postalCode: qaUser.qaPostalCode,
      } : undefined,
      customerNotes: dto.customerNotes,
      status: OrderStatus.PENDING_PAYMENT,
    }));

    // Send notifications (non-critical)
    const customer = await this.userRepo.findOne({ where: { id: customerId } });

    try {
      if (customer) await this.notificationsService.sendOrderConfirmation(order, customer);
      if (product.designer) await this.notificationsService.notifyDesigner(order, product.designer);
      if (fabric.seller) await this.notificationsService.notifyFabricSeller(order, fabric.seller);
      if (qaUser) await this.notificationsService.notifyQA(order, qaUser);
    } catch (e) {
      this.logger.warn(`Failed to send order notifications for ${order.orderNumber}: ${e.message}`);
    }

    return order;
  }

  async getOrdersForUser(userId: string, userRole: UserRole): Promise<Partial<Order>[]> {
    const relations = ['customer', 'design', 'design.designer', 'fabric', 'fabric.seller', 'measurement', 'qaAssignee'];

    switch (userRole) {
      case UserRole.CUSTOMER:
        return this.orderRepo.find({
          where: { customer: { id: userId } },
          relations,
        }).then(orders => orders.map(o => this.filterOrderByRole(o, userRole)));

      case UserRole.DESIGNER:
        return this.orderRepo.find({ relations })
          .then(orders => orders.filter(o => o.design?.designer?.id === userId))
          .then(orders => orders.map(o => this.filterOrderByRole(o, userRole)));

      case UserRole.FABRIC_SELLER:
        return this.orderRepo.find({ relations })
          .then(orders => orders.filter(o => o.fabric?.seller?.id === userId))
          .then(orders => orders.map(o => this.filterOrderByRole(o, userRole)));

      case UserRole.QA:
        return this.orderRepo.find({
          where: { qaAssignee: { id: userId } },
          relations,
        }).then(orders => orders.map(o => this.filterOrderByRole(o, userRole)));

      case UserRole.ADMIN:
        return this.orderRepo.find({ relations });

      default:
        throw new ForbiddenException('Invalid role');
    }
  }

  async getOrderById(orderId: string, userId: string, userRole: UserRole): Promise<Partial<Order>> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'design', 'design.designer', 'fabric', 'fabric.seller', 'measurement', 'qaAssignee'],
    });

    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (userRole === UserRole.CUSTOMER && order.customer?.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.filterOrderByRole(order, userRole);
  }

  private filterOrderByRole(order: Order, role: UserRole): Partial<Order> {
    switch (role) {
      case UserRole.CUSTOMER:
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          design: order.design,
          fabric: order.fabric,
          designPrice: order.designPrice,
          fabricPrice: order.fabricPrice,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          shippingCost: order.shippingCost,
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          status: order.status,
          trackingNumber: order.trackingNumber,
          customerNotes: order.customerNotes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };

      case UserRole.DESIGNER:
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          design: order.design,
          designPrice: order.designPrice,
          designerPayout: order.designerPayout,
          measurement: order.measurement,
          qaAddress: order.qaAddress,
          status: order.status,
          createdAt: order.createdAt,
        };

      case UserRole.FABRIC_SELLER:
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          fabric: order.fabric,
          fabricPrice: order.fabricPrice,
          fabricSellerPayout: order.fabricSellerPayout,
          measurement: order.measurement,
          qaAddress: order.qaAddress,
          status: order.status,
          createdAt: order.createdAt,
        };

      case UserRole.QA:
        return order;

      case UserRole.ADMIN:
        return order;

      default:
        throw new ForbiddenException('Access denied');
    }
  }

  async updateOrderStatus(orderId: string, userId: string, userRole: UserRole, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'design', 'design.designer', 'fabric', 'fabric.seller', 'qaAssignee'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const { status } = dto;
    const adminOnlyStatuses = ['CONFIRMED', 'CANCELLED', 'PAID', 'AWAITING_MATERIALS'];

    if (adminOnlyStatuses.includes(status) && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can set this status');
    }

    if (status === 'IN_PRODUCTION' && userRole !== UserRole.DESIGNER && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers can mark orders as in production');
    }

    if ((status === 'SHIPPED' || status === 'SHIPPED_TO_QA') &&
        userRole !== UserRole.FABRIC_SELLER && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only fabric sellers or admins can mark orders as shipped');
    }

    if ((status === 'QA_INSPECTION' || status === 'QA_APPROVED' || status === 'QA_REJECTED') &&
        userRole !== UserRole.QA && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only QA users can update QA status');
    }

    order.status = status;
    if (dto.trackingNumber) order.trackingNumber = dto.trackingNumber;
    if (dto.rejectionReason) order.rejectionReason = dto.rejectionReason;

    // Set timestamps
    if (status === 'QA_APPROVED') order.qaApprovedAt = new Date();
    if (status === 'QA_REJECTED') order.qaRejectedAt = new Date();
    if (status === 'SHIPPED' || status === 'SHIPPED_TO_CUSTOMER') order.shippedAt = new Date();
    if (status === 'DELIVERED') order.deliveredAt = new Date();

    const savedOrder = await this.orderRepo.save(order);

    // Send notifications (non-critical)
    try {
      if (status === 'SHIPPED' || status === 'SHIPPED_TO_CUSTOMER') {
        if (order.customer) {
          await this.notificationsService.sendShippingNotification(savedOrder, order.customer, dto.trackingNumber || '');
        }
      }
      if (status === 'DELIVERED' && order.customer) {
        await this.notificationsService.sendDeliveryConfirmation(savedOrder, order.customer);
      }
    } catch (e) {
      this.logger.warn(`Failed to send status update notifications for ${orderId}: ${e.message}`);
    }

    return savedOrder;
  }

  async approveOrder(orderId: string, qaUserId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'qaAssignee'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    order.status = OrderStatus.QA_APPROVED;
    order.qaApprovedAt = new Date();
    const savedOrder = await this.orderRepo.save(order);

    try {
      if (order.customer) {
        await this.notificationsService.sendQAApproval(savedOrder, order.customer);
      }
    } catch (e) {
      this.logger.warn(`Failed to send QA approval notification for ${orderId}: ${e.message}`);
    }

    return savedOrder;
  }

  async rejectOrder(orderId: string, qaUserId: string, reason: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'design', 'design.designer', 'fabric', 'fabric.seller', 'qaAssignee'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    order.status = OrderStatus.QA_REJECTED;
    order.rejectionReason = reason;
    order.qaRejectedAt = new Date();
    const savedOrder = await this.orderRepo.save(order);

    try {
      await this.notificationsService.sendQARejection(
        savedOrder,
        order.design?.designer,
        order.fabric?.seller,
        reason,
      );
    } catch (e) {
      this.logger.warn(`Failed to send QA rejection notifications for ${orderId}: ${e.message}`);
    }

    return savedOrder;
  }
}
