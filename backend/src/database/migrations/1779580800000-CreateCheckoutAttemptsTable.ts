import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCheckoutAttemptsTable1779580800000
  implements MigrationInterface
{
  name = 'CreateCheckoutAttemptsTable1779580800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`checkout_attempts\` (
        \`id\`                 varchar(36)                                                   NOT NULL,
        \`requestedQuantity\`  int                                                           NOT NULL,
        \`totalValueInCents\`  int                                                           NOT NULL,
        \`status\`             enum('PENDING','PROCESSING','COMPLETED','FAILED')             NOT NULL DEFAULT 'PENDING',
        \`errorMessage\`       text                                                          NULL,
        \`productId\`          varchar(36)                                                   NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_checkout_attempt_product\`
          FOREIGN KEY (\`productId\`) REFERENCES \`products\` (\`id\`)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`checkout_attempts\``);
  }
}
