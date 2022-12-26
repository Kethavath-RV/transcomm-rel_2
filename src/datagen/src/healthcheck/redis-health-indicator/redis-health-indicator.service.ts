import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Queue } from 'bull';
import { Redis } from 'ioredis';

/**
 * The RedisHealthIndicatorService checks if the health of the redis queues
 * @module HealthCheck
 */
@Injectable()
export class RedisHealthIndicatorService extends HealthIndicator {
  constructor(
    @InjectQueue('hlEventQueue') private readonly dataQueryQueue: Queue,
  ) {
    super();
  }

  /**
   * Checks the queue for workers with an active connection.
   * https://github.com/OptimalBits/bull/issues/925
   * @param key The key which will be used for the result object
   * @param timeout Max duration to wait for response from redis
   * @throws {HealthCheckError} In the case the redis is unreachable
   * @returns {Promise<HealthIndicatorResult>} The result of the health check
   */
  async pingCheck(key: string, timeout = 1000): Promise<HealthIndicatorResult> {
    try {
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Redis Timeout')), timeout);
      });
      const result = await Promise.race<Redis[] | void>([
        this.dataQueryQueue.getWorkers(),
        timeoutPromise,
      ]);
      if (!result) {
        throw new Error('Redis returned no workers');
      }
      return this.getStatus(key, result.length > 0);
    } catch (e) {
      throw new HealthCheckError('Redis failed', this.getStatus(key, false, e));
    }
  }
}
