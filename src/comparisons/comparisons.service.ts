import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ComparisonService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async compareProducts(productIds: string[]): Promise<Product[]> {
    if (productIds.length < 2) {
      throw new BadRequestException('At least 2 product IDs are required for comparison');
    }
    if (productIds.length > 4) {
      throw new BadRequestException('At most 4 product IDs are allowed for comparison');
    }

    const products = await Promise.all(
      productIds.map((id) =>
        this.productRepo.findOne({ where: { id }, relations: ['designer'] }),
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

    return products as Product[];
  }
}
