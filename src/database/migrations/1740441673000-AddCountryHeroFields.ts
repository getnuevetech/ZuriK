import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountryHeroFields1740441673000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "country_heroes" ADD COLUMN IF NOT EXISTS "flag" character varying`);
    await queryRunner.query(`ALTER TABLE "country_heroes" ADD COLUMN IF NOT EXISTS "fabrics" jsonb NOT NULL DEFAULT '[]'`);
    await queryRunner.query(`ALTER TABLE "country_heroes" ADD COLUMN IF NOT EXISTS "subtitle" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "country_heroes" DROP COLUMN IF EXISTS "subtitle"`);
    await queryRunner.query(`ALTER TABLE "country_heroes" DROP COLUMN IF EXISTS "fabrics"`);
    await queryRunner.query(`ALTER TABLE "country_heroes" DROP COLUMN IF EXISTS "flag"`);
  }
}
