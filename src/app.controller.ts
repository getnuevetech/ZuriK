import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(private dataSource: DataSource) {}

  @Get()
  getRoot() {
    return {
      status: 'ok',
      message: 'African Fashion Marketplace API',
      version: '1.0.0',
      docs: '/docs',
    };
  }

  @Get('health')
  async getHealth() {
    let dbStatus = 'connected';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      dbStatus = 'disconnected';
    }
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
    };
  }
}
