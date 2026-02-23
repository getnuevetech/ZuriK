import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      message: 'African Fashion Marketplace API',
      version: '1.0.0',
      docs: '/docs',
    };
  }
}
