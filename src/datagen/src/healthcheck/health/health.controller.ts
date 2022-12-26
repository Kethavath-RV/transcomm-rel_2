import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicatorService } from 'healthcheck/prisma-health-indicator/prisma-health-indicator.service';
import { RedisHealthIndicatorService } from 'healthcheck/redis-health-indicator/redis-health-indicator.service';

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
    private http: HttpHealthIndicator,
    private dbHealth: PrismaHealthIndicatorService,
    private readonly configService: ConfigService,
    private redisHealth: RedisHealthIndicatorService,
  ) {}

  /**
   * Checks the status of the core services.
   *
   * @returns {Promise<HealthCheckResult>} The result of the health checks
   * @example
   * {"status":"ok","info":{"hyperledger":{"status":"up"},"prisma":{"status":"up"},"redis":{"status":"up"}},"error":{},"details":{"hyperledger":{"status":"up"},"redis":{"status":"up"}}}
   */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () =>
        this.http.pingCheck(
          'hyperledger',
          `${this.configService.get('HYPERLEDGER_URL')}/ping`,
        ),
      () => this.dbHealth.pingCheck('prisma'),
      () => this.redisHealth.pingCheck('redis'),
    ]);
  }
}
