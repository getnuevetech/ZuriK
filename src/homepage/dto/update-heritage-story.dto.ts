import { PartialType } from '@nestjs/swagger';
import { CreateHeritageStoryDto } from './create-heritage-story.dto';

export class UpdateHeritageStoryDto extends PartialType(CreateHeritageStoryDto) {}
