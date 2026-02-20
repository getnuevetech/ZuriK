import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './product.entity';
import { Fabric } from './fabric.entity';
import { Designer } from './designer.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Fabric) private fabricRepo: Repository<Fabric>,
    @InjectRepository(Designer) private designerRepo: Repository<Designer>,
    private dataSource: DataSource,
  ) {}

  @Get('/health')
  async health() {
    let dbStatus = 'connected';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      dbStatus = 'disconnected';
    }
    return {
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
      database: dbStatus,
    };
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
