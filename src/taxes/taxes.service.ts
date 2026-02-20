import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxConfiguration } from './entities/tax-configuration.entity';
import { CreateTaxDto } from './dto/create-tax.dto';

@Injectable()
export class TaxesService {
  constructor(
    @InjectRepository(TaxConfiguration)
    private readonly taxRepo: Repository<TaxConfiguration>,
  ) {}

  async create(dto: CreateTaxDto): Promise<TaxConfiguration> {
    const tax = this.taxRepo.create(dto);
    return this.taxRepo.save(tax);
  }

  async findAll(): Promise<TaxConfiguration[]> {
    return this.taxRepo.find();
  }

  async findByCountry(country: string): Promise<TaxConfiguration | null> {
    return this.taxRepo.findOne({ where: { country, isActive: true } });
  }

  async update(id: string, dto: Partial<CreateTaxDto>): Promise<TaxConfiguration> {
    const tax = await this.taxRepo.findOne({ where: { id } });
    if (!tax) throw new NotFoundException(`Tax config ${id} not found`);
    Object.assign(tax, dto);
    return this.taxRepo.save(tax);
  }

  async previewTax(subtotal: number, country: string): Promise<object> {
    const tax = await this.findByCountry(country);
    if (!tax) return { subtotal, taxAmount: 0, total: subtotal, message: 'No tax config found for country' };
    const totalTaxRate = Number(tax.baseTaxRate) + Number(tax.adminMarkupRate);
    const taxAmount = (subtotal * totalTaxRate) / 100;
    return {
      subtotal,
      country,
      taxName: tax.taxName,
      baseTaxRate: tax.baseTaxRate,
      adminMarkupRate: tax.adminMarkupRate,
      totalTaxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round((subtotal + taxAmount) * 100) / 100,
    };
  }
}
