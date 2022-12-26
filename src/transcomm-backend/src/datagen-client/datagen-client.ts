import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AxiosError, AxiosResponse } from 'axios';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  ConfirmReturnDelivery,
  ConfirmReturnDeliveryDatagenParameters,
  DeliverOrderDatagenParameters,
  HyperledgerResponse,
  InitiateDeclarationDatagenParameters,
  ReturnOrder,
  ReturnRequest,
  SecretsResponse,
  SubmitOrder,
  UpdateExitConfirmationDatagenParameters,
  UpdateTransportInfoDatagenParameters,
} from 'core';
import { catchError, lastValueFrom, map } from 'rxjs';
import { ApplicationExceptionData } from '../helpers/exceptions';
import { ApplicationError } from '../models/error.model';

@Injectable()
export class DatagenClient {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    //this bind is import to ensure the axios interceptor works.
  }

  public async invokeSubmitOrder(
    order: SubmitOrder,
  ): Promise<HyperledgerResponse> {
    return this.checkDatagenInvoke('submitOrder', order);
  }

  public async invokeReturnOrder(
    order: ReturnOrder,
  ): Promise<HyperledgerResponse> {
    return this.checkDatagenInvoke('returnOrder', order);
  }

  public async invokeUpdateTransportInfo(
    orderAggregate: OrderAggregate,
    returnRequest?: ReturnRequest,
  ): Promise<HyperledgerResponse> {
    const parameters: UpdateTransportInfoDatagenParameters = returnRequest
      ? {
          order: { ...orderAggregate.order },
          pickupFile: { ...orderAggregate.pickupFile },
          direction: orderAggregate.direction,
          movementData: { ...orderAggregate.movementData },
          returnRequest: { ...returnRequest },
        }
      : {
          order: { ...orderAggregate.order },
          pickupFile: { ...orderAggregate.pickupFile },
          direction: orderAggregate.direction,
          movementData: { ...orderAggregate.movementData },
        };
    return this.checkDatagenInvoke('updateTransportInfo', parameters);
  }

  public async invokeInitiateDeclaration(
    orderAggregate: OrderAggregate,
    invoiceNumber: string,
  ): Promise<HyperledgerResponse> {
    const parameters: InitiateDeclarationDatagenParameters = {
      order: { ...orderAggregate.order },
      direction: orderAggregate.direction,
      invoiceNumber,
    };
    return this.checkDatagenInvoke('initiateDeclaration', parameters);
  }

  public async invokeDeliverOrder(
    orderAggregate: OrderAggregate,
    returnRequest?: ReturnRequest,
  ): Promise<HyperledgerResponse> {
    const parameters: DeliverOrderDatagenParameters = {
      order: { ...orderAggregate.order },
      delivered: [...orderAggregate.delivered],
      direction: orderAggregate.direction,
      pickupFile: orderAggregate.pickupFile,
    };
    if (returnRequest) {
      parameters.returnRequest = returnRequest;
    }
    return this.checkDatagenInvoke('deliverOrder', parameters);
  }

  public async invokeConfirmReturnDelivery(
    orderAggregate: OrderAggregate,
    confirmReturnDelivery: ConfirmReturnDelivery,
  ): Promise<HyperledgerResponse> {
    const parameters: ConfirmReturnDeliveryDatagenParameters = {
      order: { ...orderAggregate.order },
      confirmReturnDelivery: { ...confirmReturnDelivery },
    };
    return this.checkDatagenInvoke('confirmReturnDelivery', parameters);
  }

  public async invokeUpdateExitConfirmation(
    orderAggregate: OrderAggregate,
    declarationNumber: string,
  ): Promise<HyperledgerResponse> {
    const parameters: UpdateExitConfirmationDatagenParameters = {
      order: { ...orderAggregate.order },
      movementData: { ...orderAggregate.movementData },
      pickupFile: { ...orderAggregate.pickupFile },
      declarationNumber,
    };
    return this.checkDatagenInvoke('updateExitConfirmation', parameters);
  }

  public async invokeUpdateSecrets(): Promise<SecretsResponse> {
    const request = this.httpService
      .post<SecretsResponse>(`/secrets/update`)
      .pipe(
        map((response) => {
          return response.data;
        }),
        catchError(this.handleError()),
      );
    return lastValueFrom(request);
  }

  // This method is responsible to invoke datagen endpoints
  private checkDatagenInvoke<T>(datagenEndPoint: string, params: T) {
    if (this.configService.get('DATAGEN_ACTIVE') === 'true')
      return this.invokeDatagen(datagenEndPoint, params);
    else
      return {
        message: {
          response: 'Datagen is inactive',
          txnId: '000',
        },
        error: '',
      };
  }

  private invokeDatagen<T>(
    methodName: string,
    methodParams: T,
  ): Promise<HyperledgerResponse> {
    return this.postToDatagen(methodParams, `invoke/${methodName}`);
  }

  private async postToDatagen<T>(
    methodParams: T,
    route: string,
  ): Promise<HyperledgerResponse> {
    const request = this.httpService
      .post<HyperledgerResponse>(`/${route}`, methodParams)
      .pipe(
        map((response) => {
          return response.data;
        }),
        catchError(this.handleError()),
      );
    return lastValueFrom(request);
  }

  private handleError() {
    return (error: AxiosError) => {
      let status = 0;
      const err = new ApplicationError();

      err.addBaseErrors(error);

      if (error.response) {
        //Validate response
        this.checkIfApplicationErrorObject(error.response);
        status = error.response.status;
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        status = HttpStatus.SERVICE_UNAVAILABLE;
      } else {
        // Something happened in setting up the request that triggered an Error
        this.logger.error('Error', error.message);
      }
      err.addStatusRelatedErrors(status, 'DG');
      throw err;
    };
  }

  private checkIfApplicationErrorObject(response: AxiosResponse): void {
    const validationErrors = validateSync(
      plainToClass(ApplicationExceptionData, response.data),
    );
    if (!validationErrors.length) {
      throw new ApplicationError(response.data);
    }
  }
}
