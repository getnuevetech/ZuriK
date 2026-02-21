import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingCarrier } from './entities/shipping-carrier.entity';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { ShippingMethod } from './entities/shipping-method.entity';
import { ShipmentTracking } from './entities/shipment-tracking.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { AssignTrackingDto } from './dto/assign-tracking.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingCarrier)
    private readonly carrierRepo: Repository<ShippingCarrier>,
    @InjectRepository(ShippingMethod)
    private readonly methodRepo: Repository<ShippingMethod>,
    @InjectRepository(ShipmentTracking)
    private readonly shipmentRepo: Repository<ShipmentTracking>,
    @InjectRepository(TrackingEvent)
    private readonly eventRepo: Repository<TrackingEvent>,
  ) {}

  // --- Legacy carrier methods ---
  async create(dto: CreateCarrierDto): Promise<ShippingCarrier> {
    const carrier = this.carrierRepo.create(dto);
    return this.carrierRepo.save(carrier);
  }

  async findAll(): Promise<ShippingCarrier[]> {
    return this.carrierRepo.find({ order: { priority: 'DESC' } });
  }

  async update(id: string, dto: Partial<CreateCarrierDto>): Promise<ShippingCarrier> {
    const carrier = await this.carrierRepo.findOne({ where: { id } });
    if (!carrier) throw new NotFoundException(`Carrier ${id} not found`);
    Object.assign(carrier, dto);
    return this.carrierRepo.save(carrier);
  }

  // --- Shipping Method Management (Admin) ---
  async createMethod(dto: CreateShippingMethodDto): Promise<ShippingMethod> {
    const method = this.methodRepo.create({
      ...dto,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.methodRepo.save(method);
  }

  async findAllMethods(activeOnly?: boolean, country?: string): Promise<ShippingMethod[]> {
    const methods = await this.methodRepo.find({
      where: activeOnly ? { isActive: true } : undefined,
      order: { sortOrder: 'ASC' },
    });
    if (!country) return methods;
    return methods.filter(
      (m) => !m.supportedCountries || m.supportedCountries.some((c) => c.toUpperCase() === country.toUpperCase()),
    );
  }

  async findMethodById(id: string): Promise<ShippingMethod> {
    const method = await this.methodRepo.findOne({ where: { id } });
    if (!method) throw new NotFoundException(`Shipping method ${id} not found`);
    return method;
  }

  async updateMethod(id: string, dto: UpdateShippingMethodDto): Promise<ShippingMethod> {
    const method = await this.findMethodById(id);
    Object.assign(method, dto);
    return this.methodRepo.save(method);
  }

  async removeMethod(id: string): Promise<ShippingMethod> {
    const method = await this.findMethodById(id);
    method.isActive = false;
    return this.methodRepo.save(method);
  }

  // --- Available Methods (Customer) ---
  async getAvailableMethods(country?: string, orderTotal?: number): Promise<Array<ShippingMethod & { effectiveCost: number }>> {
    const methods = await this.findAllMethods(true, country);
    return methods.map((m) => {
      const isFree = m.freeShippingThreshold !== null && orderTotal !== undefined && orderTotal >= Number(m.freeShippingThreshold);
      return { ...m, effectiveCost: isFree ? 0 : Number(m.basePrice) };
    });
  }

  // --- Shipment Tracking (Admin) ---
  async createShipment(dto: CreateShipmentDto): Promise<ShipmentTracking> {
    const method = await this.findMethodById(dto.shippingMethodId);
    const shipment = this.shipmentRepo.create({
      orderId: dto.orderId,
      shippingMethodId: dto.shippingMethodId,
      shippingMethod: method,
      shippingCost: dto.shippingCost,
      shippingAddress: dto.shippingAddress ?? null,
      status: 'pending',
    });
    const saved = await this.shipmentRepo.save(shipment);
    await this.addTrackingEvent(saved.id, 'pending', 'Shipment created and awaiting processing', undefined);
    return saved;
  }

  async updateShipmentStatus(shipmentId: string, dto: UpdateShipmentStatusDto): Promise<ShipmentTracking> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException(`Shipment ${shipmentId} not found`);
    shipment.status = dto.status;
    if (dto.status === 'shipped' && !shipment.shippedAt) shipment.shippedAt = new Date();
    if (dto.status === 'delivered' && !shipment.deliveredAt) shipment.deliveredAt = new Date();
    const saved = await this.shipmentRepo.save(shipment);
    await this.addTrackingEvent(shipmentId, dto.status, dto.description, dto.location);
    return saved;
  }

  async assignTrackingNumber(shipmentId: string, dto: AssignTrackingDto): Promise<ShipmentTracking> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException(`Shipment ${shipmentId} not found`);
    shipment.trackingNumber = dto.trackingNumber;
    shipment.carrier = dto.carrier;
    shipment.carrierTrackingUrl = dto.carrierTrackingUrl ?? null;
    return this.shipmentRepo.save(shipment);
  }

  async listShipments(page = 1, limit = 20, status?: string): Promise<{ items: ShipmentTracking[]; total: number }> {
    const where = status ? { status } : undefined;
    const [items, total] = await this.shipmentRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  // --- Shipment Tracking (Customer) ---
  async getShipmentByOrderId(orderId: string): Promise<ShipmentTracking & { events: TrackingEvent[] }> {
    const shipment = await this.shipmentRepo.findOne({ where: { orderId } });
    if (!shipment) throw new NotFoundException(`No shipment found for order ${orderId}`);
    const events = await this.getTrackingEvents(shipment.id);
    return { ...shipment, events };
  }

  async getTrackingEvents(shipmentId: string): Promise<TrackingEvent[]> {
    return this.eventRepo.find({
      where: { shipmentId },
      order: { timestamp: 'ASC' },
    });
  }

  private async addTrackingEvent(shipmentId: string, status: string, description: string, location?: string): Promise<TrackingEvent> {
    const event = this.eventRepo.create({ shipmentId, status, description, location: location ?? null });
    return this.eventRepo.save(event);
  }
}
