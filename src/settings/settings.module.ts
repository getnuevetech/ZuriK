import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformSettings } from './entities/platform-settings.entity';
import { ThemeSettings } from './entities/theme-settings.entity';
import { SettingsService } from './settings.service';
import { SettingsController, ThemeController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSettings, ThemeSettings])],
  controllers: [SettingsController, ThemeController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
