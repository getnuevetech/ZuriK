import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';

@Injectable()
export class ComparisonService {
  constructor(
    @InjectRepository(Design)
    private readonly designRepo: Repository<Design>,
    @InjectRepository(ReadyToWearProduct)
    private readonly rtwRepo: Repository<ReadyToWearProduct>,
  ) {}

  async compareDesigns(designIds: string[]): Promise<Design[]> {
    if (designIds.length < 2) {
      throw new BadRequestException('At least 2 design IDs are required for comparison');
    }
    if (designIds.length > 4) {
      throw new BadRequestException('At most 4 design IDs are allowed for comparison');
    }

    const designs = await Promise.all(
      designIds.map((id) =>
        this.designRepo.findOne({ where: { id }, relations: ['designer'] }),
      ),
    );

    for (let i = 0; i < designs.length; i++) {
      const design = designs[i];
      if (!design) {
        throw new BadRequestException(`Design with ID "${designIds[i]}" not found`);
      }
      if (!design.isActive) {
        throw new BadRequestException(`Design "${design.name}" is not available`);
      }
    }

    return designs as Design[];
  }

  async compareReadyToWear(productIds: string[]): Promise<ReadyToWearProduct[]> {
    if (productIds.length < 2) {
      throw new BadRequestException('At least 2 product IDs are required for comparison');
    }
    if (productIds.length > 4) {
      throw new BadRequestException('At most 4 product IDs are allowed for comparison');
    }

    const products = await Promise.all(
      productIds.map((id) =>
        this.rtwRepo.findOne({ where: { id }, relations: ['designer'] }),
      ),
    );

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product) {
        throw new BadRequestException(`Product with ID "${productIds[i]}" not found`);
      }
      if (!product.isActive) {
        throw new BadRequestException(`Product "${product.name}" is not available`);
      }
    }

    return products as ReadyToWearProduct[];
  }
}
