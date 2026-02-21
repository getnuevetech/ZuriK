import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RequestWithUser } from '../auth/auth.types';
import { SellerApprovalService } from './seller-approval.service';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto';
import { ReviewSellerApplicationDto } from './dto/review-seller-application.dto';
import { SellerApplicationStatus } from './entities/seller-application.entity';

@ApiTags('seller-applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seller-applications')
export class SellerApprovalController {
  constructor(private readonly sellerApprovalService: SellerApprovalService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Apply to become a seller' })
  apply(@Request() req: RequestWithUser, @Body() dto: CreateSellerApplicationDto) {
    return this.sellerApprovalService.apply(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my applications' })
  getMyApplications(@Request() req: RequestWithUser) {
    return this.sellerApprovalService.getMyApplications(req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all applications (admin)' })
  @ApiQuery({ name: 'status', enum: SellerApplicationStatus, required: false })
  getAllApplications(@Query('status') status?: SellerApplicationStatus) {
    return this.sellerApprovalService.getAllApplications(status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get single application (admin)' })
  getApplicationById(@Param('id') id: string) {
    return this.sellerApprovalService.getApplicationById(id);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Review (approve/reject) an application (admin)' })
  reviewApplication(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: ReviewSellerApplicationDto,
  ) {
    return this.sellerApprovalService.reviewApplication(id, req.user.id, dto);
  }
}
