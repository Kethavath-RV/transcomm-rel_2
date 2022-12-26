import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { DatabaseService } from 'database/database.service';

/**
 * The PrismaHealthIndicatorService checks if the Prisma database is reachable.
 *
 * @module HealthCheck
 */
@Injectable()
export class PrismaHealthIndicatorService extends HealthIndicator {
  constructor(private prisma: DatabaseService) {
    super();
  }

  /**
   *
   * Checks the database is reachable using `SELECT 1`
   *
   * @param key The key which will be used for the result object
   * @throws {HealthCheckError} In the case the database is unreachable
   * @returns {Promise<HealthIndicatorResult>} The result of the health check
   */
  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError(
        'Prisma failed',
        this.getStatus(key, false, e),
      );
    }
  }
}
