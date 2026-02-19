import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Fabric } from './fabric.entity';
import { Designer } from './designer.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Fabric) private fabricRepo: Repository<Fabric>,
    @InjectRepository(Designer) private designerRepo: Repository<Designer>,
  ) {}

  @Get('/health')
  health() {
    return { status: 'ok', timestamp: new Date() };
  }

  @Get('/products')
  async getProducts() {
    return await this.productRepo.find();
  }

  @Get('/fabrics')
  async getFabrics() {
    return await this.fabricRepo.find();
  }

  @Get('/designers')
  async getDesigners() {
    return await this.designerRepo.find();
  }
}
