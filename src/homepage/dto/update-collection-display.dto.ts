import { PartialType } from '@nestjs/swagger';
import { CreateCollectionDisplayDto } from './create-collection-display.dto';

export class UpdateCollectionDisplayDto extends PartialType(CreateCollectionDisplayDto) {}
