import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  health() {
    return { status: 'ok', timestamp: new Date() };
  }

  @Get('/products')
  getProducts() {
    return [];
  }

  @Get('/fabrics')
  getFabrics() {
    return [];
  }

  @Get('/designers')
  getDesigners() {
    return [];
  }
}
