import { PartialType } from '@nestjs/swagger';
import { CreateCountryHeroDto } from './create-country-hero.dto';

export class UpdateCountryHeroDto extends PartialType(CreateCountryHeroDto) {}
