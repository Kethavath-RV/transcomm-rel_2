import { HttpModule, HttpService } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { DatabaseModule } from '../database/database.module';
import { HyperledgerEventsController } from './hl-events-controller/hl-events.controller';
import { HyperledgerEventsHandlerService } from './hl-events-handler/hl-events-handler.service';
import { HyperledgerAuthenticationService } from './hyperledger-client/hyperledger-authentication/hyperledger-authentication.service';
import { HyperledgerClientService } from './hyperledger-client/hyperledger-client.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    BullModule.registerQueue({
      name: 'dataqueryQueue',
    }),
    BullModule.registerQueue({
      name: 'resubscribeIfUpQueue',
    }),
    BullModule.registerQueue({
      name: 'hlEventQueue',
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('HYPERLEDGER_URL'),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    HyperledgerClientService,
    HyperledgerEventsHandlerService,
    HyperledgerAuthenticationService,
  ],
  controllers: [HyperledgerEventsController],
  exports: [HyperledgerClientService, HyperledgerEventsHandlerService],
})
export class HyperledgerModule implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authentication: HyperledgerAuthenticationService,
  ) {
    //this bind is important to ensure the axios interceptor works.
    this.errorInterceptor = this.errorInterceptor.bind(this);
    this.requestInterceptor = this.requestInterceptor.bind(this);
  }

  onModuleInit(): void {
    this.httpService.axiosRef.interceptors.request.use(this.requestInterceptor);
    this.httpService.axiosRef.interceptors.response.use(
      undefined,
      this.errorInterceptor,
    );
  }

  private delayRetry = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  private async errorInterceptor(error) {
    const config = error.config;
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= this.configService.get('AXIOS_RETRY_COUNT')) {
      this.logger.error(`hit retry limit, rejecting`);
      return Promise.reject(error);
    }
    config.__retryCount += 1;
    this.logger.warn(`Retry attempt: ${config.__retryCount}`);

    await this.delayRetry(1000 * (2 * config.__retryCount));

    this.logger.warn('re-authenticating');
    this.authentication.clearToken();
    return this.httpService.axiosRef(config);
  }

  private async requestInterceptor(config: AxiosRequestConfig) {
    this.logger.debug('Sending Request', JSON.stringify(config, null, 2));
    if (config.url === '/client/authenticate') {
      return config;
    }
    const token = await this.authentication.getAuthenticationToken();
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  }
}
