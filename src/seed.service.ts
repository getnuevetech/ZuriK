import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seed } from './seed.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(Seed)
        private readonly seedRepository: Repository<Seed>,
    ) {}

    async createSeed(seedData: Partial<Seed>): Promise<Seed> {
        try {
            const seed = await this.seedRepository.create(seedData);
            return await this.seedRepository.save(seed);
        } catch (error) {
            this.logger.error('Error creating seed:', error);
            throw new Error('Could not create seed. Please try again later.');
        }
    }

    async findAllSeeds(): Promise<Seed[]> {
        try {
            return await this.seedRepository.find();
        } catch (error) {
            this.logger.error('Error finding seeds:', error);
            throw new Error('Could not retrieve seeds. Please try again later.');
        }
    }

    async findSeedById(id: number): Promise<Seed> {
        try {
            const seed = await this.seedRepository.findOne(id);
            if (!seed) {
                this.logger.warn(`Seed with id ${id} not found.`);
                throw new Error(`Seed with id ${id} not found.`);
            }
            return seed;
        } catch (error) {
            this.logger.error('Error finding seed by ID:', error);
            throw new Error('Could not retrieve seed. Please try again later.');
        }
    }

    async updateSeed(id: number, seedData: Partial<Seed>): Promise<Seed> {
        try {
            await this.findSeedById(id); // check if the seed exists
            await this.seedRepository.update(id, seedData);
            return this.findSeedById(id);
        } catch (error) {
            this.logger.error('Error updating seed:', error);
            throw new Error('Could not update seed. Please try again later.');
        }
    }

    async deleteSeed(id: number): Promise<void> {
        try {
            const seed = await this.findSeedById(id);
            await this.seedRepository.delete(seed);
        } catch (error) {
            this.logger.error('Error deleting seed:', error);
            throw new Error('Could not delete seed. Please try again later.');
        }
    }
}