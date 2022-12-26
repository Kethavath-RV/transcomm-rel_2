import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AdminModule } from './admin/admin.module';
import { AirwayNumToOrderIdLookupsModule } from './aggregates/airwayNumToOrderIdLookup/airwaynum-orderid-lookups-module';
import { mawbAirwayNumsLookupsModule } from './aggregates/mawbAirwayNumsLookup/mawb-airwaynums-lookups-module';
import { OrdersModule } from './aggregates/orders/orders.module';
import { VcIdLookupsModule } from './aggregates/vcIdLookups/vcid-lookups-module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlessModule } from './bless/bless.module';
import { DatabaseModule } from './database/database.module';
import { validate } from './env.validation';
import { EventSourcingModule } from './event-sourcing/event-sourcing.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { ConsumerModule } from './kafka/consumer/consumer.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validate,
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
    }),
    ConsumerModule,
    AuthModule,
    UsersModule,
    DatabaseModule,
    EventSourcingModule,
    OrdersModule,
    VcIdLookupsModule,
    mawbAirwayNumsLookupsModule,
    AirwayNumToOrderIdLookupsModule,
    CqrsModule,
    BlessModule,
    HealthCheckModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
