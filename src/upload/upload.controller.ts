import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const imageFilter = (req: any, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    return callback(new BadRequestException('Only JPG, PNG, WebP files allowed'), false);
  }
  callback(null, true);
};

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { fileFilter: imageFilter, limits: { fileSize: MAX_FILE_SIZE } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const url = await this.cloudinaryService.uploadImage(file);
    return { url };
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10, { fileFilter: imageFilter, limits: { fileSize: MAX_FILE_SIZE } }))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');
    const urls = await this.cloudinaryService.uploadImages(files);
    return { urls };
  }

  @Post('product')
  @UseInterceptors(FilesInterceptor('files', 5, { fileFilter: imageFilter, limits: { fileSize: MAX_FILE_SIZE } }))
  async uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');
    const urls = await this.cloudinaryService.uploadImages(files, 'african-fashion/products');
    return { urls };
  }

  @Post('fabric')
  @UseInterceptors(FilesInterceptor('files', 5, { fileFilter: imageFilter, limits: { fileSize: MAX_FILE_SIZE } }))
  async uploadFabricImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');
    const urls = await this.cloudinaryService.uploadImages(files, 'african-fashion/fabrics');
    return { urls };
  }
}
