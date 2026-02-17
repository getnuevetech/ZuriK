import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderItem, OrderSplit } from '../../database/entities/order.entity';

/**
 * OrderSplittingService
 * 
 * This service handles the critical business logic of splitting order payments
 * between three parties in the African Fashion eCommerce platform:
 * 
 * 1. ADMIN (Platform) - Receives platform fee for facilitating the transaction
 * 2. DESIGNER - Receives payment for design work/patterns
 * 3. FABRIC SELLER - Receives payment for fabric materials
 * 
 * PAYMENT FLOW LOGIC:
 * ====================
 * 
 * For each order, the total payment is split as follows:
 * 
 * 1. Platform Fee (Admin):
 *    - Fixed percentage of subtotal (default: 10%)
 *    - Goes to admin for platform maintenance and operation
 *    - Example: $100 order → $10 platform fee
 * 
 * 2. Designer Payment:
 *    - 100% of design item prices (minus platform fee on their portion)
 *    - For custom orders combining design + fabric:
 *      * Designer gets: design_price - (design_price * platform_fee_percentage)
 *    - Example: $50 design → Designer gets $45 (if 10% platform fee)
 * 
 * 3. Fabric Seller Payment:
 *    - 100% of fabric prices (minus platform fee on their portion)
 *    - For fabric orders:
 *      * Seller gets: fabric_price - (fabric_price * platform_fee_percentage)
 *    - Example: $50 fabric → Seller gets $45 (if 10% platform fee)
 * 
 * SPLIT CALCULATION ALGORITHM:
 * =============================
 * 
 * Step 1: Calculate platform fee from subtotal
 * Step 2: Group order items by seller (designer or fabric seller)
 * Step 3: For each seller:
 *         - Calculate their total item value
 *         - Calculate their portion of platform fee (proportional to their items)
 *         - Net payment = item_value - seller_platform_portion
 * Step 4: Admin receives sum of all platform fee portions
 * 
 * Example Order: Design ($60) + Fabric ($40) = $100 subtotal
 * - Platform fee: $10 (10% of $100)
 * - Designer portion: $60 - $6 (60% of platform fee) = $54
 * - Fabric seller portion: $40 - $4 (40% of platform fee) = $36
 * - Admin receives: $10 (platform fee)
 * - Total: $54 + $36 + $10 = $100 ✓
 */
@Injectable()
export class OrderSplittingService {
  private readonly platformFeePercentage: number;

  constructor(private readonly configService: ConfigService) {
    this.platformFeePercentage = Number(
      this.configService.get('PLATFORM_FEE_PERCENTAGE', 10),
    );
  }

  /**
   * Calculate order splits for all parties involved
   * 
   * @param items - Array of order items (designs and fabrics)
   * @param platformFee - Total platform fee for the order
   * @returns Array of OrderSplit objects defining payment distribution
   */
  async calculateOrderSplits(
    items: OrderItem[],
    platformFee: number,
  ): Promise<OrderSplit[]> {
    const splits: OrderSplit[] = [];

    // Step 1: Add platform fee split (goes to admin)
    splits.push({
      recipientId: 'admin',
      recipientName: 'African Fashion Platform',
      recipientType: 'admin',
      amount: platformFee,
      description: `Platform fee (${this.platformFeePercentage}% of order)`,
    });

    // Step 2: Group items by seller and calculate their splits
    const sellerGroups = this.groupItemsBySeller(items);

    // Step 3: Calculate payment for each seller
    for (const [sellerId, sellerItems] of sellerGroups.entries()) {
      const sellerTotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Calculate proportional platform fee for this seller
      // This is the portion of platform fee attributed to their items
      const sellerPlatformPortion = (sellerTotal * this.platformFeePercentage) / 100;

      // Net payment to seller = their items total - their platform fee portion
      const sellerNetPayment = sellerTotal - sellerPlatformPortion;

      // Determine seller type (designer or fabric seller)
      const sellerType = sellerItems[0].type === 'design' ? 'designer' : 'fabric_seller';

      const firstItem = sellerItems[0];
      if (firstItem) {
        splits.push({
          recipientId: sellerId,
          recipientName: firstItem.sellerName,
          recipientType: sellerType,
          amount: sellerNetPayment,
          description: this.generateSellerDescription(sellerItems, sellerTotal, sellerPlatformPortion),
        });
      }
    }

    return splits;
  }

  /**
   * Group order items by their seller ID
   * This allows us to calculate total amounts per seller
   */
  private groupItemsBySeller(items: OrderItem[]): Map<string, OrderItem[]> {
    const groups = new Map<string, OrderItem[]>();

    for (const item of items) {
      if (!groups.has(item.sellerId)) {
        groups.set(item.sellerId, []);
      }
      const sellerItems = groups.get(item.sellerId);
      if (sellerItems) {
        sellerItems.push(item);
      }
    }

    return groups;
  }

  /**
   * Generate a human-readable description of the seller's split
   */
  private generateSellerDescription(
    items: OrderItem[],
    total: number,
    platformPortion: number,
  ): string {
    const itemType = items[0].type === 'design' ? 'design(s)' : 'fabric(s)';
    const itemCount = items.length;
    
    return `Payment for ${itemCount} ${itemType} (Total: $${total.toFixed(2)} - Platform Fee: $${platformPortion.toFixed(2)} = Net: $${(total - platformPortion).toFixed(2)})`;
  }

  /**
   * Validate that order splits sum to the correct total
   * This is a safety check to ensure our split calculation is correct
   */
  validateSplits(splits: OrderSplit[], expectedTotal: number): boolean {
    const actualTotal = splits.reduce((sum, split) => sum + split.amount, 0);
    const difference = Math.abs(actualTotal - expectedTotal);
    
    // Allow for small floating point errors (less than 1 cent)
    return difference < 0.01;
  }
}
