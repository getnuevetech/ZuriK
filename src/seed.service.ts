import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Fabric } from './entities/fabric.entity';
import { Designer } from './entities/designer.entity';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Fabric)
        private readonly fabricRepository: Repository<Fabric>,
        @InjectRepository(Designer)
        private readonly designerRepository: Repository<Designer>,
    ) {}

    async seed() {
        console.log('Seeding database...');

        // Seed Fabrics
        const fabrics = [
            { name: 'Cotton', description: 'Soft and breathable fabric.' },
            { name: 'Silk', description: 'Luxurious and smooth fabric.' },
            { name: 'Wool', description: 'Warm and insulating fabric.' },
        ];
        await this.seedFabrics(fabrics);

        // Seed Designers
        const designers = [
            { name: 'John Doe', bio: 'Innovative fashion designer.' },
            { name: 'Jane Smith', bio: 'Sustainable fashion advocate.' },
        ];
        await this.seedDesigners(designers);

        // Seed Products
        const products = [
            { name: 'Elegant Dress', fabric: fabrics[0], designer: designers[0], price: 49.99 },
            { name: 'Silk Scarf', fabric: fabrics[1], designer: designers[1], price: 25.99 },
        ];
        await this.seedProducts(products);

        console.log('Seeding completed successfully.');
    }

    private async seedFabrics(fabrics) {
        try {
            for (const fabric of fabrics) {
                const existingFabric = await this.fabricRepository.findOne({ where: { name: fabric.name } });
                if (!existingFabric) {
                    await this.fabricRepository.save(fabric);
                    console.log(`Fabric created: ${fabric.name}`);
                } else {
                    console.log(`Fabric already exists: ${fabric.name}`);
                }
            }
        } catch (error) {
            console.error('Error seeding fabrics:', error);
        }
    }

    private async seedDesigners(designers) {
        try {
            for (const designer of designers) {
                const existingDesigner = await this.designerRepository.findOne({ where: { name: designer.name } });
                if (!existingDesigner) {
                    await this.designerRepository.save(designer);
                    console.log(`Designer created: ${designer.name}`);
                } else {
                    console.log(`Designer already exists: ${designer.name}`);
                }
            }
        } catch (error) {
            console.error('Error seeding designers:', error);
        }
    }

    private async seedProducts(products) {
        try {
            for (const product of products) {
                const existingProduct = await this.productRepository.findOne({ where: { name: product.name } });
                if (!existingProduct) {
                    await this.productRepository.save(product);
                    console.log(`Product created: ${product.name}`);
                } else {
                    console.log(`Product already exists: ${product.name}`);
                }
            }
        } catch (error) {
            console.error('Error seeding products:', error);
        }
    }
}