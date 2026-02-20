import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxConfiguration } from './entities/tax-configuration.entity';
import { TaxesService } from './taxes.service';
import { TaxesController } from './taxes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaxConfiguration])],
  controllers: [TaxesController],
  providers: [TaxesService],
  exports: [TaxesService],
})
export class TaxesModule {}
