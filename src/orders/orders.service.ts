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
import { Product } from '../products/entities/product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { CreateCustomDesignOrderDto } from './dto/create-custom-design-order.dto';
import { CreateReadyToWearOrderDto } from './dto/create-ready-to-wear-order.dto';
import { CreateFabricOnlyOrderDto } from './dto/create-fabric-only-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateSubOrderStatusDto, UpdateDesignerSubOrderStatusDto } from './dto/update-sub-order-status.dto';
import { UpdateSubOrderTrackingDto } from './dto/update-sub-order-tracking.dto';

const PLATFORM_FEE_RATE = 0.10;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(FabricSellerOrder)
    private readonly fabricSellerOrderRepo: Repository<FabricSellerOrder>,
    @InjectRepository(DesignerOrder)
    private readonly designerOrderRepo: Repository<DesignerOrder>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Fabric)
    private readonly fabricRepo: Repository<Fabric>,
    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
    const design = await this.productRepo.findOne({
      where: { id: dto.designId, isActive: true },
      relations: ['designer'],
    });
    if (!design) throw new NotFoundException(`Design ${dto.designId} not found or inactive`);

    const fabric = await this.fabricRepo.findOne({
      where: { id: dto.fabricId, isActive: true },
      relations: ['seller'],
    });
    if (!fabric) throw new NotFoundException(`Fabric ${dto.fabricId} not found or inactive`);

    if (fabric.stock <= 0) throw new BadRequestException('Fabric is out of stock');

    if (fabric.country !== design.country) {
      throw new BadRequestException(
        `Fabric country (${fabric.country}) must match design country (${design.country}) for custom orders`,
      );
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
    const fabricPrice = Number(fabric.customerPrice);
    const totalPrice = designPrice + fabricPrice;
    const platformFee = totalPrice * PLATFORM_FEE_RATE;
    const designerEarnings = designPrice * (1 - PLATFORM_FEE_RATE);
    const fabricSellerEarnings = fabricPrice * (1 - PLATFORM_FEE_RATE);

    const order = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber: this.generateOrderNumber(),
        orderType: OrderType.CUSTOM_DESIGN,
        status: OrderStatus.PENDING_PAYMENT,
        customer: { id: customerId },
        design: { id: dto.designId },
        fabric: { id: dto.fabricId },
        measurement: { id: measurement.id },
        designPrice,
        fabricPrice,
        totalPrice,
        designerEarnings,
        fabricSellerEarnings,
        platformFee,
        customerNotes: dto.customerNotes,
        quantity: 1,
      }),
    );

    // Get designer address for fabric shipment
    const designer = design.designer;
    const qaUser = await this.userRepo.findOne({ where: { role: UserRole.QA, isActive: true } });

    // Create FabricSellerOrder — ship fabric to designer (NOT customer)
    await this.fabricSellerOrderRepo.save(
      this.fabricSellerOrderRepo.create({
        order: { id: order.id },
        fabricSeller: { id: fabric.seller.id },
        fabric: { id: dto.fabricId },
        earnings: fabricSellerEarnings,
        shipToName: designer ? `${designer.firstName || ''} ${designer.lastName || ''}`.trim() : 'Designer',
        shipToAddress: designer?.addressLine1 || '',
        shipToCity: designer?.city || '',
        shipToCountry: designer?.country || design.country,
        status: 'pending',
      }),
    );

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
        status: 'awaiting_fabric',
      }),
    );

    // Decrement fabric stock
    fabric.stock = fabric.stock - 1;
    await this.fabricRepo.save(fabric);

    return order;
  }

  async createReadyToWearOrder(customerId: string, dto: CreateReadyToWearOrderDto): Promise<Order> {
    const design = await this.productRepo.findOne({
      where: { id: dto.designId, isActive: true },
      relations: ['designer'],
    });
    if (!design) throw new NotFoundException(`Design ${dto.designId} not found or inactive`);

    const quantity = dto.quantity || 1;
    const designPrice = Number(design.customerPrice) * quantity;
    const totalPrice = designPrice;
    const platformFee = totalPrice * PLATFORM_FEE_RATE;
    const designerEarnings = designPrice * (1 - PLATFORM_FEE_RATE);

    const order = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber: this.generateOrderNumber(),
        orderType: OrderType.READY_TO_WEAR,
        status: OrderStatus.PENDING_PAYMENT,
        customer: { id: customerId },
        design: { id: dto.designId },
        designPrice,
        totalPrice,
        designerEarnings,
        platformFee,
        customerNotes: dto.customerNotes,
        quantity,
      }),
    );

    const qaUser = await this.userRepo.findOne({ where: { role: UserRole.QA, isActive: true } });
    const qaAddr = this.getQaAddress(qaUser || undefined);

    await this.designerOrderRepo.save(
      this.designerOrderRepo.create({
        order: { id: order.id },
        designer: { id: design.designer.id },
        design: { id: dto.designId },
        earnings: designerEarnings,
        shipToName: qaAddr.name,
        shipToAddress: qaAddr.address,
        shipToCity: qaAddr.city,
        shipToCountry: qaAddr.country,
        status: 'in_production',
      }),
    );

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
    const totalPrice = fabricPrice;
    const platformFee = totalPrice * PLATFORM_FEE_RATE;
    const fabricSellerEarnings = fabricPrice * (1 - PLATFORM_FEE_RATE);

    const order = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber: this.generateOrderNumber(),
        orderType: OrderType.FABRIC_ONLY,
        status: OrderStatus.PENDING_PAYMENT,
        customer: { id: customerId },
        fabric: { id: dto.fabricId },
        fabricPrice,
        totalPrice,
        fabricSellerEarnings,
        platformFee,
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

    return order;
  }

  async getOrdersForUser(userId: string, userRole: UserRole): Promise<any[]> {
    switch (userRole) {
      case UserRole.CUSTOMER: {
        const orders = await this.orderRepo.find({
          where: { customer: { id: userId } },
          relations: ['design', 'fabric', 'measurement'],
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
          relations: ['design', 'fabric', 'customer'],
        });
        return orders.map(o => this.filterOrderForQa(o));
      }

      case UserRole.ADMIN: {
        return this.orderRepo.find({
          relations: ['customer', 'design', 'fabric', 'measurement'],
        });
      }

      default:
        throw new ForbiddenException('Invalid role');
    }
  }

  async getOrderById(orderId: string, userId: string, userRole: UserRole): Promise<any> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'design', 'fabric', 'measurement'],
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
      fabric: order.fabric,
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
    const isApproved = order.status === OrderStatus.QA_APPROVED;
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      design: order.design,
      fabric: order.fabric,
      measurement: order.measurement,
      qaComments: order.qaComments,
      quantity: order.quantity,
      // Customer address revealed ONLY after qa_approved
      customerAddress: isApproved ? {
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
      relations: ['customer'],
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

    return this.orderRepo.save(order);
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
