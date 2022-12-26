import { HttpModule, HttpService } from '@nestjs/axios';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DatagenClient } from './datagen-client';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('DATAGEN_URL'),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [DatagenClient],
  providers: [DatagenClient],
})
export class DatagenClientModule implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    //this bind is important to ensure the axios interceptor works.

    this.errorInterceptor = this.errorInterceptor.bind(this);
  }
  onModuleInit(): void {
    this.httpService.axiosRef.interceptors.response.use(
      undefined,
      this.errorInterceptor,
    );
  }
  private delayRetry = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  private async errorInterceptor(error) {
    const config = error.config;
    if (error.status > 499) {
      config.__retryCount = config.__retryCount || 0;
      const intervals = this.configService
        .get('AUTO_RETRIES_INTERVAL')
        ?.toString()
        .split(',') ?? ['1'];
      const interval = Number(intervals[config.__retryCount]);
      if (!interval) {
        this.logger.error(`hit retry limit, rejecting`);
        return Promise.reject(error);
      }

      config.__retryCount += 1;
      this.logger.warn(`Retry attempt: ${config.__retryCount}`);
      await this.delayRetry(60 * 1000 * interval);
      //   // await this.delayRetry(1000) // for testing
      return axios(config);
    }
    return Promise.reject(error);
  }
}
