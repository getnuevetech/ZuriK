import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async getAddresses(userId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async getAddressById(userId: string, addressId: string): Promise<Address> {
    const address = await this.addressRepo.findOne({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException('Access denied');
    return address;
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<Address> {
    const count = await this.addressRepo.count({ where: { userId } });

    if (dto.isDefault || count === 0) {
      await this.addressRepo.update({ userId }, { isDefault: false });
    }

    const address = this.addressRepo.create({
      ...dto,
      userId,
      isDefault: dto.isDefault || count === 0,
    });
    return this.addressRepo.save(address);
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.getAddressById(userId, addressId);

    if (dto.isDefault) {
      await this.addressRepo.update({ userId }, { isDefault: false });
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.getAddressById(userId, addressId);
    const wasDefault = address.isDefault;
    await this.addressRepo.remove(address);

    if (wasDefault) {
      const remaining = await this.addressRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 1,
      });
      if (remaining.length > 0) {
        await this.addressRepo.update(remaining[0].id, { isDefault: true });
      }
    }
  }

  async setDefault(userId: string, addressId: string): Promise<Address> {
    await this.getAddressById(userId, addressId);
    await this.addressRepo.update({ userId }, { isDefault: false });
    await this.addressRepo.update(addressId, { isDefault: true });
    return this.getAddressById(userId, addressId);
  }
}
