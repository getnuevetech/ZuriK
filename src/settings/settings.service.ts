import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSettings } from './entities/platform-settings.entity';
import { ThemeSettings, ThemeName } from './entities/theme-settings.entity';
import { THEME_PRESETS } from './theme-presets';
import { CreateSettingsDto } from './dto/create-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PlatformSettings)
    private readonly settingsRepo: Repository<PlatformSettings>,
    @InjectRepository(ThemeSettings)
    private readonly themeRepo: Repository<ThemeSettings>,
  ) {}

  async create(dto: CreateSettingsDto): Promise<PlatformSettings> {
    const settings = this.settingsRepo.create(dto);
    return this.settingsRepo.save(settings);
  }

  async findAll(): Promise<PlatformSettings[]> {
    return this.settingsRepo.find();
  }

  async findActive(): Promise<PlatformSettings | null> {
    return this.settingsRepo.findOne({ where: { isActive: true } });
  }

  async update(id: string, dto: Partial<CreateSettingsDto>): Promise<PlatformSettings> {
    const settings = await this.settingsRepo.findOne({ where: { id } });
    if (!settings) throw new NotFoundException(`Settings ${id} not found`);
    Object.assign(settings, dto);
    return this.settingsRepo.save(settings);
  }

  calculateFee(designPrice: number, fabricPrice: number, settings: PlatformSettings): number {
    const subtotal = designPrice + fabricPrice;
    return (subtotal * Number(settings.percentageFee)) / 100;
  }

  async previewFee(designPrice: number, fabricPrice: number): Promise<object> {
    const settings = await this.findActive();
    if (!settings) return { error: 'No active settings found' };
    const fee = this.calculateFee(designPrice, fabricPrice, settings);
    return {
      designPrice,
      fabricPrice,
      subtotal: designPrice + fabricPrice,
      platformFee: fee,
      total: designPrice + fabricPrice + fee,
    };
  }

  async getThemeSettings(): Promise<{ name: string; colors: Record<string, string> }> {
    let theme = await this.themeRepo.findOne({ where: {} });
    if (!theme) {
      theme = this.themeRepo.create({ activeTheme: ThemeName.BOLD_VIBRANT_AFRICAN });
      theme = await this.themeRepo.save(theme);
    }
    const preset = THEME_PRESETS[theme.activeTheme];
    return { name: preset.name, colors: preset.colors };
  }

  async updateTheme(themeName: string): Promise<{ name: string; colors: Record<string, string> }> {
    if (!Object.values(ThemeName).includes(themeName as ThemeName)) {
      throw new BadRequestException(`Invalid theme: ${themeName}`);
    }
    let theme = await this.themeRepo.findOne({ where: {} });
    if (!theme) {
      theme = this.themeRepo.create({ activeTheme: themeName as ThemeName });
    } else {
      theme.activeTheme = themeName as ThemeName;
    }
    await this.themeRepo.save(theme);
    const preset = THEME_PRESETS[themeName as ThemeName];
    return { name: preset.name, colors: preset.colors };
  }

  getThemePresets(): Record<string, { name: string; description: string; colors: Record<string, string> }> {
    return THEME_PRESETS;
  }
}
