import { PartialType } from '@nestjs/swagger';
import { CreateHeroStatDto } from './create-hero-stat.dto';

export class UpdateHeroStatDto extends PartialType(CreateHeroStatDto) {}
