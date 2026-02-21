import { PartialType } from '@nestjs/swagger';
import { CreateCollectionPostDto } from './create-collection-post.dto';

export class UpdateCollectionPostDto extends PartialType(CreateCollectionPostDto) {}
