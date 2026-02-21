import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly usageRepo: Repository<CouponUsage>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const code = dto.code.toUpperCase();
    const existing = await this.couponRepo.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException(`Coupon code "${code}" already exists`);
    }
    const coupon = this.couponRepo.create({
      ...dto,
      code,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
    return this.couponRepo.save(coupon);
  }

  async findAll(query?: {
    active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Coupon[]; total: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const qb = this.couponRepo.createQueryBuilder('coupon');

    if (query?.search) {
      qb.andWhere('coupon.code ILIKE :search', { search: `%${query.search}%` });
    }
    if (query?.active !== undefined) {
      qb.andWhere('coupon.isActive = :active', { active: query.active });
    }

    qb.orderBy('coupon.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);
    if (dto.code) {
      const code = dto.code.toUpperCase();
      const existing = await this.couponRepo.findOne({ where: { code } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Coupon code "${code}" already exists`);
      }
      dto = { ...dto, code };
    }
    Object.assign(coupon, dto);
    return this.couponRepo.save(coupon);
  }

  async remove(id: string): Promise<Coupon> {
    const coupon = await this.findOne(id);
    coupon.isActive = false;
    return this.couponRepo.save(coupon);
  }

  async getUsageStats(id: string): Promise<{
    coupon: Coupon;
    usageCount: number;
    usages: CouponUsage[];
  }> {
    const coupon = await this.findOne(id);
    const usages = await this.usageRepo.find({
      where: { couponId: id },
      order: { usedAt: 'DESC' },
    });
    return { coupon, usageCount: coupon.usageCount, usages };
  }

  async validateCoupon(
    code: string,
    userId: string,
    orderTotal: number,
  ): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discountAmount?: number;
    message?: string;
  }> {
    const upperCode = code.toUpperCase();
    const coupon = await this.couponRepo.findOne({ where: { code: upperCode } });

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'This coupon is inactive' };
    }

    const now = new Date();

    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return { valid: false, message: 'This coupon is not yet active' };
    }

    if (coupon.expiryDate && now > new Date(coupon.expiryDate)) {
      return { valid: false, message: 'This coupon has expired' };
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    if (coupon.perUserLimit !== null) {
      const userUsageCount = await this.usageRepo.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsageCount >= coupon.perUserLimit) {
        return { valid: false, message: 'You have reached the usage limit for this coupon' };
      }
    }

    if (coupon.minimumOrderAmount !== null && orderTotal < Number(coupon.minimumOrderAmount)) {
      return {
        valid: false,
        message: `Minimum order of ₦${Number(coupon.minimumOrderAmount).toLocaleString()} required`,
      };
    }

    let discountAmount: number;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maximumDiscount !== null) {
        discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscount));
      }
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), orderTotal);
    }

    return { valid: true, coupon, discountAmount };
  }

  async applyCoupon(
    code: string,
    userId: string,
    orderId: string,
    orderTotal: number,
  ): Promise<{ discountAmount: number }> {
    const result = await this.validateCoupon(code, userId, orderTotal);
    if (!result.valid || result.discountAmount === undefined || !result.coupon) {
      throw new BadRequestException(result.message || 'Invalid coupon');
    }

    await this.couponRepo.increment({ id: result.coupon.id }, 'usageCount', 1);

    const usage = this.usageRepo.create({
      couponId: result.coupon.id,
      userId,
      orderId,
      discountApplied: result.discountAmount,
    });
    await this.usageRepo.save(usage);

    return { discountAmount: result.discountAmount };
  }
}
