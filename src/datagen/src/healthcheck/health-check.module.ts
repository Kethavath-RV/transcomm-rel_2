import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from 'database/database.module';
import { HealthController } from './health/health.controller';
import { PrismaHealthIndicatorService } from './prisma-health-indicator/prisma-health-indicator.service';
import { RedisHealthIndicatorService } from './redis-health-indicator/redis-health-indicator.service';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    TerminusModule,
    HttpModule,
    BullModule.registerQueue({
      name: 'hlEventQueue',
    }),
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicatorService, RedisHealthIndicatorService],
})
export class HealthCheckModule {}
