import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderType, OrderStatus } from './entities/order.entity';
import { FabricSellerOrder } from './entities/fabric-seller-order.entity';
import { DesignerOrder } from './entities/designer-order.entity';
import { UserRole, User } from '../users/entities/user.entity';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { CreateCustomDesignOrderDto } from './dto/create-custom-design-order.dto';
import { CreateReadyToWearOrderDto } from './dto/create-ready-to-wear-order.dto';
import { CreateFabricOnlyOrderDto } from './dto/create-fabric-only-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateSubOrderStatusDto, UpdateDesignerSubOrderStatusDto } from './dto/update-sub-order-status.dto';
import { UpdateSubOrderTrackingDto } from './dto/update-sub-order-tracking.dto';
import { SettingsService } from '../settings/settings.service';
import { TaxesService } from '../taxes/taxes.service';
import { NotificationTriggersService } from '../notifications/notification-triggers.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { LoyaltyTransactionType } from '../loyalty/entities/loyalty-transaction.entity';
import { ReviewPromptsService } from '../review-prompts/review-prompts.service';

const DEFAULT_PLATFORM_FEE_RATE = 10;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(FabricSellerOrder)
    private readonly fabricSellerOrderRepo: Repository<FabricSellerOrder>,
    @InjectRepository(DesignerOrder)
    private readonly designerOrderRepo: Repository<DesignerOrder>,
    @InjectRepository(Design)
    private readonly designRepo: Repository<Design>,
    @InjectRepository(ReadyToWearProduct)
    private readonly readyToWearRepo: Repository<ReadyToWearProduct>,
    @InjectRepository(Fabric)
    private readonly fabricRepo: Repository<Fabric>,
    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly settingsService: SettingsService,
    private readonly taxesService: TaxesService,
    private readonly notificationTriggers: NotificationTriggersService,
    private readonly loyaltyService: LoyaltyService,
    private readonly reviewPromptsService: ReviewPromptsService,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const uniquePart = `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`.toUpperCase().substr(-6);
    return `ORD-${datePart}-${uniquePart}`;
  }

  private getQaAddress(qaUser?: User): { name: string; address: string; city: string; country: string } {
    return {
      name: qaUser ? `${qaUser.firstName || ''} ${qaUser.lastName || ''}`.trim() || 'QA Team' : 'QA Team',
      address: qaUser?.addressLine1 || 'QA Facility Address',
      city: qaUser?.city || 'Lagos',
      country: qaUser?.country || 'Nigeria',
    };
  }

  async createCustomDesignOrder(customerId: string, dto: CreateCustomDesignOrderDto): Promise<Order> {
    const design = await this.designRepo.findOne({
      where: { id: dto.designId, isActive: true },
      relations: ['designer'],
    });
    if (!design) throw new NotFoundException(`Design ${dto.designId} not found or inactive`);

    const fabricChosenByDesigner = dto.fabricChosenByDesigner || !dto.fabricId;
    let fabric: Fabric | null = null;

    if (!fabricChosenByDesigner && dto.fabricId) {
      fabric = await this.fabricRepo.findOne({
        where: { id: dto.fabricId, isActive: true },
        relations: ['seller'],
      });
      if (!fabric) throw new NotFoundException(`Fabric ${dto.fabricId} not found or inactive`);
      if (fabric.stock <= 0) throw new BadRequestException('Fabric is out of stock');
    }

    const measurement = await this.measurementRepo.save(
      this.measurementRepo.create({
        customer: { id: customerId },
        chest: dto.chest,
        waist: dto.waist,
        hips: dto.hips,
        shoulder: dto.shoulder,
        sleeveLength: dto.sleeveLength,
        length: dto.length,
        unit: dto.unit || 'CM',
        notes: dto.measurementNotes,
      }),
    );

    const designPrice = Number(design.customerPrice);
    const fabricPrice = fabric ? Number(fabric.customerPrice) : 0;

    const platformSettings = await this.settingsService.findActive();
    const platformFeeRate = platformSettings
      ? Number(platformSettings.percentageFee)
      : DEFAULT_PLATFORM_FEE_RATE;
    const platformFee = platformSettings
      ? this.settingsService.calculateFee(designPrice, fabricPrice, platformSettings)
      : ((designPrice + fabricPrice) * DEFAULT_PLATFORM_FEE_RATE) / 100;

    const subtotal = designPrice + fabricPrice + platformFee;
    const designerCountry = design.designer?.country || '';
    const taxConfig = await this.taxesService.findByCountry(designerCountry);
    const totalTaxRate = taxConfig
      ? Number(taxConfig.baseTaxRate) + Number(taxConfig.adminMarkupRate)
      : 0;
    const taxAmount = (subtotal * totalTaxRate) / 100;
    const totalPrice = subtotal + taxAmount;

    const earningsRate = 1 - platformFeeRate / 100;
    const designerEarnings = designPrice * earningsRate;
    const fabricSellerEarnings = fabricPrice * earningsRate;

    const order = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber: this.generateOrderNumber(),
        orderType: OrderType.CUSTOM_DESIGN,
        status: OrderStatus.PENDING_PAYMENT,
        customer: { id: customerId },
        design: { id: dto.designId },
        fabric: fabric ? { id: fabric.id } : undefined,
        fabricChosenByDesigner,
        measurement: { id: measurement.id },
        designPrice,
        fabricPrice,
        subtotal,
        platformFee,
        taxRate: totalTaxRate,
        taxAmount,
        totalPrice,
        designerEarnings,
        fabricSellerEarnings,
        customerNotes: dto.customerNotes,
        quantity: 1,
      }),
    );

    const designer = design.designer;
    const qaUser = await this.userRepo.findOne({ where: { role: UserRole.QA, isActive: true } });

    if (!fabricChosenByDesigner && fabric) {
      // Create FabricSellerOrder — ship fabric to designer
      await this.fabricSellerOrderRepo.save(
        this.fabricSellerOrderRepo.create({
          order: { id: order.id },
          fabricSeller: { id: fabric.seller.id },
          fabric: { id: fabric.id },
          earnings: fabricSellerEarnings,
          shipToName: designer ? `${designer.firstName || ''} ${designer.lastName || ''}`.trim() : 'Designer',
          shipToAddress: designer?.addressLine1 || '',
          shipToCity: designer?.city || '',
          shipToCountry: designer?.country || '',
          status: 'pending',
        }),
      );

      // Decrement fabric stock
      fabric.stock = fabric.stock - 1;
      await this.fabricRepo.save(fabric);
    }

    // Create DesignerOrder — ship finished product to QA
    const qaAddr = this.getQaAddress(qaUser || undefined);
    await this.designerOrderRepo.save(
      this.designerOrderRepo.create({
        order: { id: order.id },
        designer: { id: designer.id },
        design: { id: dto.designId },
        measurement: { id: measurement.id },
        earnings: designerEarnings,
        shipToName: qaAddr.name,
        shipToAddress: qaAddr.address,
        shipToCity: qaAddr.city,
        shipToCountry: qaAddr.country,
        status: fabricChosenByDesigner ? 'awaiting_fabric' : 'awaiting_fabric',
      }),
    );

    // Trigger notifications (fire-and-forget)
    const customer = await this.userRepo.findOne({ where: { id: customerId } });
    if (customer) {
      this.notificationTriggers.onOrderCreated(order, customer).catch(() => undefined);
    }

    return order;
  }

  async createReadyToWearOrder(customerId: string, dto: CreateReadyToWearOrderDto): Promise<Order> {
    const rtwProduct = await this.readyToWearRepo.findOne({
      where: { id: dto.readyToWearProductId, isActive: true },
      relations: ['designer'],
    });
    if (!rtwProduct) throw new NotFoundException(`Ready-to-wear product ${dto.readyToWearProductId} not found or inactive`);

    const quantity = dto.quantity || 1;
    const designPrice = Number(rtwProduct.customerPrice) * quantity;

    const platformSettings = await this.settingsService.findActive();
    const platformFeeRate = platformSettings
      ? Number(platformSettings.percentageFee)
      : DEFAULT_PLATFORM_FEE_RATE;
    const platformFee = platformSettings
      ? this.settingsService.calculateFee(designPrice, 0, platformSettings)
      : (designPrice * DEFAULT_PLATFORM_FEE_RATE) / 100;

    const subtotal = designPrice + platformFee;
    const designerCountry = rtwProduct.designer?.country || '';
    const taxConfig = await this.taxesService.findByCountry(designerCountry);
    const totalTaxRate = taxConfig
      ? Number(taxConfig.baseTaxRate) + Number(taxConfig.adminMarkupRate)
      : 0;
    const taxAmount = (subtotal * totalTaxRate) / 100;
    const totalPrice = subtotal + taxAmount;

    const earningsRate = 1 - platformFeeRate / 100;
    const designerEarnings = designPrice * earningsRate;

    const order = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber: this.generateOrderNumber(),
        orderType: OrderType.READY_TO_WEAR,
        status: OrderStatus.PENDING_PAYMENT,
        customer: { id: customerId },
        readyToWearProduct: { id: dto.readyToWearProductId },
        designPrice,
        subtotal,
        platformFee,
        taxRate: totalTaxRate,
        taxAmount,
        totalPrice,
        designerEarnings,
        customerNotes: dto.customerNotes,
        quantity,
      }),
    );

    const qaUser = await this.userRepo.findOne({ where: { role: UserRole.QA, isActive: true } });
    const qaAddr = this.getQaAddress(qaUser || undefined);

    await this.designerOrderRepo.save(
      this.designerOrderRepo.create({
        order: { id: order.id },
        designer: { id: rtwProduct.designer.id },
        earnings: designerEarnings,
        shipToName: qaAddr.name,
        shipToAddress: qaAddr.address,
        shipToCity: qaAddr.city,
        shipToCountry: qaAddr.country,
        status: 'in_production',
      }),
    );

    // Trigger notifications (fire-and-forget)
    const customer = await this.userRepo.findOne({ where: { id: customerId } });
    if (customer) {
      this.notificationTriggers.onOrderCreated(order, customer).catch(() => undefined);
    }

    return order;
  }

  async createFabricOnlyOrder(customerId: string, dto: CreateFabricOnlyOrderDto): Promise<Order> {
    const fabric = await this.fabricRepo.findOne({
      where: { id: dto.fabricId, isActive: true },
      relations: ['seller'],
    });
    if (!fabric) throw new NotFoundException(`Fabric ${dto.fabricId} not found or inactive`);
    if (fabric.stock <= 0) throw new BadRequestException('Fabric is out of stock');

    const quantity = dto.quantity || 1;
    const fabricPrice = Number(fabric.customerPrice) * quantity;

    const platformSettings = await this.settingsService.findActive();
    const platformFeeRate = platformSettings
      ? Number(platformSettings.percentageFee)
      : DEFAULT_PLATFORM_FEE_RATE;
    const platformFee = platformSettings
      ? this.settingsService.calculateFee(0, fabricPrice, platformSettings)
      : (fabricPrice * DEFAULT_PLATFORM_FEE_RATE) / 100;

    const subtotal = fabricPrice + platformFee;
    const sellerCountry = fabric.seller?.country || '';
    const taxConfig = await this.taxesService.findByCountry(sellerCountry);
    const totalTaxRate = taxConfig
      ? Number(taxConfig.baseTaxRate) + Number(taxConfig.adminMarkupRate)
      : 0;
    const taxAmount = (subtotal * totalTaxRate) / 100;
    const totalPrice = subtotal + taxAmount;

    const earningsRate = 1 - platformFeeRate / 100;
    const fabricSellerEarnings = fabricPrice * earningsRate;

    const order = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber: this.generateOrderNumber(),
        orderType: OrderType.FABRIC_ONLY,
        status: OrderStatus.PENDING_PAYMENT,
        customer: { id: customerId },
        fabric: { id: dto.fabricId },
        fabricPrice,
        subtotal,
        platformFee,
        taxRate: totalTaxRate,
        taxAmount,
        totalPrice,
        fabricSellerEarnings,
        customerNotes: dto.customerNotes,
        quantity,
      }),
    );

    const qaUser = await this.userRepo.findOne({ where: { role: UserRole.QA, isActive: true } });
    const qaAddr = this.getQaAddress(qaUser || undefined);

    await this.fabricSellerOrderRepo.save(
      this.fabricSellerOrderRepo.create({
        order: { id: order.id },
        fabricSeller: { id: fabric.seller.id },
        fabric: { id: dto.fabricId },
        earnings: fabricSellerEarnings,
        shipToName: qaAddr.name,
        shipToAddress: qaAddr.address,
        shipToCity: qaAddr.city,
        shipToCountry: qaAddr.country,
        status: 'pending',
      }),
    );

    fabric.stock = fabric.stock - quantity;
    await this.fabricRepo.save(fabric);

    // Trigger notifications (fire-and-forget)
    const customer = await this.userRepo.findOne({ where: { id: customerId } });
    if (customer) {
      this.notificationTriggers.onOrderCreated(order, customer).catch(() => undefined);
    }

    return order;
  }

  async getOrdersForUser(userId: string, userRole: UserRole): Promise<any[]> {
    switch (userRole) {
      case UserRole.CUSTOMER: {
        const orders = await this.orderRepo.find({
          where: { customer: { id: userId } },
          relations: ['design', 'readyToWearProduct', 'fabric', 'measurement'],
        });
        return orders.map(o => this.filterOrderForCustomer(o));
      }

      case UserRole.DESIGNER: {
        const designerOrders = await this.designerOrderRepo.find({
          where: { designer: { id: userId } },
          relations: ['order', 'design', 'measurement'],
        });
        return designerOrders;
      }

      case UserRole.FABRIC_SELLER: {
        const fabricSellerOrders = await this.fabricSellerOrderRepo.find({
          where: { fabricSeller: { id: userId } },
          relations: ['order', 'fabric'],
        });
        return fabricSellerOrders;
      }

      case UserRole.QA: {
        const qaStatuses = [
          OrderStatus.SHIPPED_TO_QA,
          OrderStatus.QA_INSPECTION,
          OrderStatus.QA_APPROVED,
          OrderStatus.QA_REJECTED,
        ];
        const orders = await this.orderRepo.find({
          where: { status: In(qaStatuses) },
          relations: ['design', 'readyToWearProduct', 'fabric', 'customer'],
        });
        return orders.map(o => this.filterOrderForQa(o));
      }

      case UserRole.ADMIN: {
        return this.orderRepo.find({
          relations: ['customer', 'design', 'readyToWearProduct', 'fabric', 'measurement'],
        });
      }

      default:
        throw new ForbiddenException('Invalid role');
    }
  }

  async getOrderById(orderId: string, userId: string, userRole: UserRole): Promise<any> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'design', 'readyToWearProduct', 'fabric', 'measurement'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    switch (userRole) {
      case UserRole.CUSTOMER:
        if (order.customer?.id !== userId) throw new ForbiddenException('Access denied');
        return this.filterOrderForCustomer(order);

      case UserRole.DESIGNER: {
        const designerOrder = await this.designerOrderRepo.findOne({
          where: { order: { id: orderId }, designer: { id: userId } },
          relations: ['order', 'design', 'measurement'],
        });
        if (!designerOrder) throw new ForbiddenException('Access denied');
        return designerOrder;
      }

      case UserRole.FABRIC_SELLER: {
        const fso = await this.fabricSellerOrderRepo.findOne({
          where: { order: { id: orderId }, fabricSeller: { id: userId } },
          relations: ['order', 'fabric'],
        });
        if (!fso) throw new ForbiddenException('Access denied');
        return fso;
      }

      case UserRole.QA:
        return this.filterOrderForQa(order);

      case UserRole.ADMIN:
        return order;

      default:
        throw new ForbiddenException('Access denied');
    }
  }

  private filterOrderForCustomer(order: Order): object {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      design: order.design,
      readyToWearProduct: order.readyToWearProduct,
      fabric: order.fabric,
      fabricChosenByDesigner: order.fabricChosenByDesigner,
      designPrice: order.designPrice,
      fabricPrice: order.fabricPrice,
      totalPrice: order.totalPrice,
      customerNotes: order.customerNotes,
      quantity: order.quantity,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private filterOrderForQa(order: Order & { customer?: User }): object {
    const addressVisibleStatuses = [
      OrderStatus.SHIPPED_TO_QA,
      OrderStatus.QA_INSPECTION,
      OrderStatus.QA_APPROVED,
      OrderStatus.SHIPPED_TO_CUSTOMER,
    ];
    const showAddress = addressVisibleStatuses.includes(order.status);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      design: order.design,
      readyToWearProduct: order.readyToWearProduct,
      fabric: order.fabric,
      measurement: order.measurement,
      qaComments: order.qaComments,
      quantity: order.quantity,
      customerAddress: showAddress ? {
        addressLine1: order.customer?.addressLine1,
        city: order.customer?.city,
        country: order.customer?.country,
        postalCode: order.customer?.postalCode,
      } : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async updateOrderStatus(orderId: string, userId: string, userRole: UserRole, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'design', 'design.designer', 'fabric'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const { status } = dto;
    const adminOnly = [OrderStatus.PAID, OrderStatus.AWAITING_MATERIALS, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
    const designerAllowed = [OrderStatus.IN_PRODUCTION, OrderStatus.SHIPPED_TO_QA];
    const qaAllowed = [OrderStatus.QA_INSPECTION, OrderStatus.QA_APPROVED, OrderStatus.QA_REJECTED, OrderStatus.SHIPPED_TO_CUSTOMER];

    if (adminOnly.includes(status) && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can set this status');
    }
    if (designerAllowed.includes(status) && userRole !== UserRole.DESIGNER && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers can set this status');
    }
    if (qaAllowed.includes(status) && userRole !== UserRole.QA && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only QA users can set this status');
    }
    if (status === OrderStatus.SHIPPED_TO_CUSTOMER && order.status !== OrderStatus.QA_APPROVED && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Can only ship to customer after QA approval');
    }

    order.status = status;
    if (dto.trackingNumber) order.qaToCustomerTracking = dto.trackingNumber;
    if (dto.qaComments) order.qaComments = dto.qaComments;

    const saved = await this.orderRepo.save(order);

    // Trigger notifications based on status (fire-and-forget)
    this.triggerStatusNotifications(saved, dto).catch(() => undefined);

    return saved;
  }

  private async triggerStatusNotifications(order: Order & { customer?: User }, dto: UpdateOrderStatusDto): Promise<void> {
    const customer = order.customer;
    if (!customer) return;

    switch (order.status) {
      case OrderStatus.PAID:
        await this.notificationTriggers.onPaymentReceived(order, customer);
        break;
      case OrderStatus.SHIPPED_TO_QA:
        await this.notificationTriggers.onShippedToQA(order);
        break;
      case OrderStatus.QA_APPROVED: {
        const designer = order.design?.designer as User | undefined;
        await this.notificationTriggers.onQAApproved(order, customer, designer);
        break;
      }
      case OrderStatus.QA_REJECTED: {
        const designer = order.design?.designer as User | undefined;
        await this.notificationTriggers.onQARejected(order, designer);
        break;
      }
      case OrderStatus.SHIPPED_TO_CUSTOMER:
        await this.notificationTriggers.onShippedToCustomer(order, customer, dto.trackingNumber);
        break;
      case OrderStatus.DELIVERED:
        await this.notificationTriggers.onDelivered(order, customer);
        await this.reviewPromptsService.createPrompts(order);
        const loyaltyPoints = this.loyaltyService.getPointsForPurchase(Number(order.totalPrice));
        if (loyaltyPoints > 0) {
          await this.loyaltyService.earnPoints(
            customer.id,
            loyaltyPoints,
            LoyaltyTransactionType.EARNED_PURCHASE,
            `Points earned for order #${order.orderNumber}`,
            order.id,
          );
        }
        break;
      default:
        break;
    }
  }

  async updateDesignerSubOrderStatus(subOrderId: string, designerId: string, dto: UpdateDesignerSubOrderStatusDto): Promise<DesignerOrder> {
    const subOrder = await this.designerOrderRepo.findOne({
      where: { id: subOrderId },
      relations: ['designer'],
    });
    if (!subOrder) throw new NotFoundException(`Designer order ${subOrderId} not found`);
    if (subOrder.designer.id !== designerId) throw new ForbiddenException('Access denied');

    subOrder.status = dto.status;
    return this.designerOrderRepo.save(subOrder);
  }

  async updateDesignerSubOrderTracking(subOrderId: string, designerId: string, dto: UpdateSubOrderTrackingDto): Promise<DesignerOrder> {
    const subOrder = await this.designerOrderRepo.findOne({
      where: { id: subOrderId },
      relations: ['designer', 'order'],
    });
    if (!subOrder) throw new NotFoundException(`Designer order ${subOrderId} not found`);
    if (subOrder.designer.id !== designerId) throw new ForbiddenException('Access denied');

    subOrder.trackingNumber = dto.trackingNumber;
    if (dto.fabricTrackingNumber) subOrder.fabricTrackingNumber = dto.fabricTrackingNumber;

    // Also update the main order's designerToQaTracking
    if (subOrder.order) {
      await this.orderRepo.update(subOrder.order.id, { designerToQaTracking: dto.trackingNumber });
    }

    return this.designerOrderRepo.save(subOrder);
  }

  async updateFabricSellerSubOrderStatus(subOrderId: string, sellerId: string, dto: UpdateSubOrderStatusDto): Promise<FabricSellerOrder> {
    const subOrder = await this.fabricSellerOrderRepo.findOne({
      where: { id: subOrderId },
      relations: ['fabricSeller'],
    });
    if (!subOrder) throw new NotFoundException(`Fabric seller order ${subOrderId} not found`);
    if (subOrder.fabricSeller.id !== sellerId) throw new ForbiddenException('Access denied');

    subOrder.status = dto.status;
    return this.fabricSellerOrderRepo.save(subOrder);
  }

  async updateFabricSellerSubOrderTracking(subOrderId: string, sellerId: string, dto: UpdateSubOrderTrackingDto): Promise<FabricSellerOrder> {
    const subOrder = await this.fabricSellerOrderRepo.findOne({
      where: { id: subOrderId },
      relations: ['fabricSeller', 'order'],
    });
    if (!subOrder) throw new NotFoundException(`Fabric seller order ${subOrderId} not found`);
    if (subOrder.fabricSeller.id !== sellerId) throw new ForbiddenException('Access denied');

    subOrder.trackingNumber = dto.trackingNumber;

    // Also update the main order's fabricToDesignerTracking
    if (subOrder.order) {
      await this.orderRepo.update(subOrder.order.id, { fabricToDesignerTracking: dto.trackingNumber });
    }

    return this.fabricSellerOrderRepo.save(subOrder);
  }
}
