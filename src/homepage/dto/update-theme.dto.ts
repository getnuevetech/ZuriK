import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ThemeKey } from '../entities/theme-settings.entity';

export class UpdateThemeDto {
  @ApiPropertyOptional({ enum: ThemeKey })
  @IsOptional()
  @IsEnum(ThemeKey)
  activeTheme?: ThemeKey;
}
