import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformSettings } from './entities/platform-settings.entity';
import { SettingsService } from './settings.service';
import { SettingsController, PublicSettingsController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSettings])],
  controllers: [PublicSettingsController, SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
