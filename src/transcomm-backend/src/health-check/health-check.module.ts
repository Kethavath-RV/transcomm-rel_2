import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from 'database/database.module';
import { HealthController } from './health/health.controller';
import { PrismaHealthIndicatorService } from './prisma-health-indicator/prisma-health-indicator.service';

@Module({
  imports: [DatabaseModule, TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicatorService],
})
export class HealthCheckModule {}
