import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { PrismaHealthIndicatorService } from 'health-check/prisma-health-indicator/prisma-health-indicator.service';

/**
 * The HealthCheck controller, entrypoint to conduct all health checks.
 * The controller reports the status of the database, redis and hyperledger
 * if any false a status of error is reported.
 *
 * @module HealthCheck
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dbHealth: PrismaHealthIndicatorService,
  ) {}

  /**
   * Checks the status of the core services.
   *
   * @returns {Promise<HealthCheckResult>} The result of the health checks
   * @example
   * {"status":"ok","info":{""prisma":{"status":"up"}}}
   */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.dbHealth.pingCheck('prisma')]);
  }
}
