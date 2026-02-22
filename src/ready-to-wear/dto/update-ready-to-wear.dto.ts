import { PartialType } from '@nestjs/mapped-types';
import { CreateReadyToWearDto } from './create-ready-to-wear.dto';

export class UpdateReadyToWearDto extends PartialType(CreateReadyToWearDto) {}
