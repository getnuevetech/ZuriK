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
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  getCart(@Request() req: RequestWithUser) {
    return this.cartService.getCart(req.user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get cart summary (items, subtotal, itemCount)' })
  getCartSummary(@Request() req: RequestWithUser) {
    return this.cartService.getCartSummary(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  addToCart(@Request() req: RequestWithUser, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync localStorage cart to server after login' })
  syncCart(@Request() req: RequestWithUser, @Body() body: { items: any[] }) {
    return this.cartService.syncCart(req.user.id, body.items ?? []);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateCartItem(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, id, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@Request() req: RequestWithUser) {
    await this.cartService.clearCart(req.user.id);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove cart item' })
  async removeCartItem(@Request() req: RequestWithUser, @Param('id') id: string) {
    await this.cartService.removeCartItem(req.user.id, id);
    return { success: true };
  }
}
