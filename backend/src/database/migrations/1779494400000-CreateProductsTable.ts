import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1779494400000 implements MigrationInterface {
  name = 'CreateProductsTable1779494400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`products\` (
        \`id\`              varchar(36)  NOT NULL,
        \`name\`            varchar(255) NOT NULL,
        \`image\`           varchar(255) NOT NULL,
        \`priceInCents\`    int          NOT NULL,
        \`stockQuantity\`   int          NOT NULL,
        \`version\`         int          NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`products\``);
  }
}
