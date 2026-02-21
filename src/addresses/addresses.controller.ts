import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.types';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List user addresses' })
  getAddresses(@Request() req: RequestWithUser) {
    return this.addressesService.getAddresses(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single address' })
  getAddressById(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.addressesService.getAddressById(req.user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create address' })
  createAddress(@Request() req: RequestWithUser, @Body() dto: CreateAddressDto) {
    return this.addressesService.createAddress(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  updateAddress(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.updateAddress(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(@Request() req: RequestWithUser, @Param('id') id: string) {
    await this.addressesService.deleteAddress(req.user.id, id);
    return { success: true };
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  setDefault(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.addressesService.setDefault(req.user.id, id);
  }
}
