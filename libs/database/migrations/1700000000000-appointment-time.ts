import { MigrationInterface, QueryRunner } from 'typeorm';

export class appointmentTime1700000000000 implements MigrationInterface {
  name = 'appointmentTime1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "schedule_time" character varying(5)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "schedule_time"`,
    );
  }
}
