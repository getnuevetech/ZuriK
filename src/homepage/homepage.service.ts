import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CountryHero, HeroImage } from './entities/country-hero.entity';
import { CollectionDisplay, DisplayMode } from './entities/collection-display.entity';
import { HomepageLayout, LayoutSection } from './entities/homepage-layout.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCountryHeroDto } from './dto/create-country-hero.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';

@Injectable()
export class HomepageService {
  constructor(
    @InjectRepository(CountryHero)
    private readonly countryHeroRepo: Repository<CountryHero>,
    @InjectRepository(CollectionDisplay)
    private readonly collectionRepo: Repository<CollectionDisplay>,
    @InjectRepository(HomepageLayout)
    private readonly layoutRepo: Repository<HomepageLayout>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // ---- Country Heroes ----

  async getCountryHeroes(): Promise<CountryHero[]> {
    return this.countryHeroRepo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } });
  }

  async getAllCountryHeroes(): Promise<CountryHero[]> {
    return this.countryHeroRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async createCountryHero(dto: CreateCountryHeroDto): Promise<CountryHero> {
    const hero = this.countryHeroRepo.create(dto);
    return this.countryHeroRepo.save(hero);
  }

  async updateCountryHero(id: string, dto: Partial<CreateCountryHeroDto>): Promise<CountryHero> {
    const hero = await this.countryHeroRepo.findOne({ where: { id } });
    if (!hero) throw new NotFoundException(`Country hero ${id} not found`);
    Object.assign(hero, dto);
    return this.countryHeroRepo.save(hero);
  }

  async deleteCountryHero(id: string): Promise<void> {
    const hero = await this.countryHeroRepo.findOne({ where: { id } });
    if (!hero) throw new NotFoundException(`Country hero ${id} not found`);
    await this.countryHeroRepo.remove(hero);
  }

  async addHeroImage(countryHeroId: string, imageData: HeroImage): Promise<CountryHero> {
    const hero = await this.countryHeroRepo.findOne({ where: { id: countryHeroId } });
    if (!hero) throw new NotFoundException(`Country hero ${countryHeroId} not found`);
    hero.heroImages = [...(hero.heroImages || []), imageData];
    return this.countryHeroRepo.save(hero);
  }

  async removeHeroImage(countryHeroId: string, imageIndex: number): Promise<CountryHero> {
    const hero = await this.countryHeroRepo.findOne({ where: { id: countryHeroId } });
    if (!hero) throw new NotFoundException(`Country hero ${countryHeroId} not found`);
    hero.heroImages = hero.heroImages.filter((_, i) => i !== imageIndex);
    return this.countryHeroRepo.save(hero);
  }

  async reorderCountries(orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) => this.countryHeroRepo.update(id, { displayOrder: index })),
    );
  }

  // ---- Collections ----

  async getCollections(): Promise<{ collection: CollectionDisplay; products: Product[] }[]> {
    const collections = await this.collectionRepo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } });
    return Promise.all(
      collections.map(async (collection) => ({
        collection,
        products: await this.resolveCollectionProducts(collection),
      })),
    );
  }

  async getAllCollections(): Promise<CollectionDisplay[]> {
    return this.collectionRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async createCollection(dto: CreateCollectionDto): Promise<CollectionDisplay> {
    const collection = this.collectionRepo.create(dto);
    return this.collectionRepo.save(collection);
  }

  async updateCollection(id: string, dto: Partial<CreateCollectionDto>): Promise<CollectionDisplay> {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundException(`Collection ${id} not found`);
    Object.assign(collection, dto);
    return this.collectionRepo.save(collection);
  }

  async deleteCollection(id: string): Promise<void> {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundException(`Collection ${id} not found`);
    await this.collectionRepo.remove(collection);
  }

  async getCollectionProducts(collectionId: string): Promise<Product[]> {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException(`Collection ${collectionId} not found`);
    return this.resolveCollectionProducts(collection);
  }

  private async resolveCollectionProducts(collection: CollectionDisplay): Promise<Product[]> {
    if (collection.displayMode === DisplayMode.EDITORIAL_BANNER) return [];

    const limit = collection.maxProducts || 8;

    if (collection.productIds?.length) {
      return this.productRepo.find({ where: { id: In(collection.productIds), isActive: true }, relations: ['designer'] });
    }

    const where = collection.category
      ? { isActive: true, category: collection.category }
      : { isActive: true };

    return this.productRepo.find({ where, order: { createdAt: 'DESC' }, take: limit, relations: ['designer'] });
  }

  async reorderCollections(orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) => this.collectionRepo.update(id, { displayOrder: index })),
    );
  }

  // ---- Layout ----

  async getHomepageLayout(): Promise<HomepageLayout> {
    let layout = await this.layoutRepo.findOne({ where: {} });
    if (!layout) {
      layout = this.layoutRepo.create();
      layout = await this.layoutRepo.save(layout);
    }
    return layout;
  }

  async updateHomepageLayout(sections: LayoutSection[]): Promise<HomepageLayout> {
    let layout = await this.layoutRepo.findOne({ where: {} });
    if (!layout) {
      layout = this.layoutRepo.create({ sections });
    } else {
      layout.sections = sections;
    }
    return this.layoutRepo.save(layout);
  }
}
