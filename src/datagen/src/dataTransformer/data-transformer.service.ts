import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Address,
  businessCodeAccountNoMapping,
  CheckPointFile,
  ConfirmReturnDelivery,
  ConfirmReturnDeliveryParameters,
  ConsigneeAddress,
  DateConverterSlashesToDashes,
  DateTimeOffsetToDubaiTime,
  DeliveredView,
  DeliverOrderParameters,
  DeliverySignature,
  Direction,
  EcomBusinessCodeLookup,
  ErrorMessagePayloadModel,
  findCountryCode,
  findPaymentModeAndAccountNo,
  InitiateDeclarationParameters,
  InvoiceForSubmitOrderParametersForReturn,
  ModeType,
  Movement,
  Order,
  ReturnOrder,
  ReturnRequest,
  SubmitOrder,
  SubmitOrderParameters,
  SubmitOrderParametersForReturn,
  UpdateExitConfirmationParameters,
  UpdateTransportInfoParameters,
  YesNo,
} from 'core';
import { v4 as uuidv4 } from 'uuid';
import { BlessClientService } from '../bless/bless-client/bless-client.service';
import { SecretsService } from '../secrets/secrets.service';
const crypto = require('crypto');

@Injectable()
export class DataTransformerService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private configService: ConfigService,
    private secretsService: SecretsService,
    private blessClientService: BlessClientService,
  ) {}

  async transformSubmitOrder(
    submitOrder: SubmitOrder,
  ): Promise<SubmitOrderParameters> {
    const orderDateDubaiTime = this.convertISO8061ToDubaiTime(
      submitOrder.orderDate,
      true,
    );
    const actionDateDubaiTime = this.convertISO8061ToDubaiTime(
      submitOrder.actionDate,
      true,
    );

    const newInvoices = submitOrder.invoices.map((inv) => {
      return {
        ...inv,
        invoiceDate: this.convertISO8061ToDubaiTime(inv.invoiceDate, false),
        invoiceType: inv.invoiceType.toString(),
        paymentInstrumentType: inv.paymentInstrumentType.toString(),
        lineItems: inv.lineItems,
      };
    });

    const payload = {
      orderNumber: submitOrder.orderNumber,
      orderDate: orderDateDubaiTime,
      actionDate: actionDateDubaiTime,
      ecomBusinessCode: submitOrder.ecomBusinessCode ?? '',
      mode: submitOrder.mode,
      billTo: submitOrder.billTo ?? '',
      shipTo: submitOrder.shipTo ?? '',
      consigneeAddress:
        submitOrder.consigneeAddress ?? ({} as ConsigneeAddress),
      billToAddress: submitOrder.billToAddress ?? ({} as Address),
      shipToAddress: submitOrder.shipToAddress ?? ({} as Address),
      documents: submitOrder.documents ?? [],
      invoices: newInvoices,
      referenceID: submitOrder.referenceId ?? '',
      uuid: uuidv4(),
      consigneeName: submitOrder.consigneeName ?? '',
      consigneeCode: '',
      jwt: this.getJwtOrOrgCode(submitOrder),
      eCommBusinessName: '',
      kvps: submitOrder.__kvp ? submitOrder.__kvp : [],
      uuid20: this.generateUUID20(),
    };

    const { jwt, uuid20, uuid, ...rest } = payload;
    const footer = await this.generateFooter(
      rest,
      this.getJwtOrOrgCode(submitOrder),
      submitOrder.ecomBusinessCode,
      submitOrder.orderNumber,
      submitOrder.ecomBusinessCode,
    );

    return {
      ...payload,
      ...footer,
    };
  }

  async transformSubmitOrderForReturn(
    submitOrder: ReturnOrder,
  ): Promise<SubmitOrderParametersForReturn> {
    const actionDateDubaiTime = this.convertISO8061ToDubaiTime(
      submitOrder.actionDate,
      true,
    );

    const newInvoices: InvoiceForSubmitOrderParametersForReturn[] =
      submitOrder.invoices.map((inv) => {
        const { returnDetail, ...restOfInvoice } = inv;

        return {
          ...restOfInvoice,
          returnDetail: inv.returnDetail,
        };
      });

    const payload = {
      orderNumber: submitOrder.orderNumber,
      orderDate: '',
      actionDate: actionDateDubaiTime,
      ecomBusinessCode: submitOrder.ecomBusinessCode ?? '',
      mode: submitOrder.mode,
      billTo: '',
      shipTo: '',
      consigneeAddress: {},
      billToAddress: {},
      shipToAddress: {},
      documents: [],
      invoices: newInvoices,
      referenceID: '',
      uuid: uuidv4(),
      consigneeName: '',
      consigneeCode: '',
      jwt: submitOrder.invoices[0]?.exporterCode ?? '',
      eCommBusinessName: '',
      kvps: [],
      uuid20: this.generateUUID20(),
    };

    const { jwt, uuid20, uuid, orderDate, ...rest } = payload;
    const footer = await this.generateFooter(
      rest,
      jwt,
      submitOrder.ecomBusinessCode,
      submitOrder.orderNumber,
      submitOrder.ecomBusinessCode,
    );
    return {
      ...payload,
      ...footer,
    };
  }

  async transformUpdateTransportInfo(orderAggregate: {
    order: Order;
    pickupFile: CheckPointFile;
    direction: Direction;
    movementData: Movement;
  }): Promise<UpdateTransportInfoParameters> {
    const movement = orderAggregate.movementData;
    const returnDetail = orderAggregate.order.invoices[0]?.returnDetail;
    const newInvoices = orderAggregate.order.invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
    }));
    const jwtAndOrgCodeValue =
      orderAggregate.order.invoices[0]?.deliveryProviderBusinessCode ?? '';
    const businessAccount =
      EcomBusinessCodeLookup[orderAggregate.order.ecomBusinessCode];

    const payload = {
      orderNumber: orderAggregate.order.orderNumber,
      shippingParameterId: '',
      ecomOrgCode: orderAggregate.order.ecomBusinessCode ?? '',
      invoices: newInvoices,
      direction: orderAggregate.direction,
      returnRequestNo: returnDetail?.returnRequestNo ?? '',
      oldHouseTransportDocNo: '',
      mode: orderAggregate.order.mode,
      autoInitiateDeclaration:
        orderAggregate.order.mode === ModeType.Update ? YesNo.No : YesNo.Yes, //TBD
      shippingDetail: {
        shippingAgentBusinessCode: jwtAndOrgCodeValue,
        modeOfTransport: '8',
        carrierNumber: movement.movementNumber, //movement number
        carrierRegistrationNo: movement.movementNumber, //movement number
        dateOfDeparture:
          DateConverterSlashesToDashes(
            movement.shippingDetails.dateOfDeparture,
          ) ?? '', //outbound
        portOfLoad: this.checkWhichShipmentValueToUse(
          movement.shippingDetails.portOfLoad,
        ),
        portOfDischarge: movement.shippingDetails.portOfDischarge,
        originalLoadPort: this.checkWhichShipmentValueToUse(
          movement.shippingDetails.originalLoadPort,
        ),
        destinationCountry: findCountryCode(
          movement.shippingDetails.destinationCountry,
        ),
        pointOfExit: 'AFZ',
        cargoHandlerCode: businessAccount?.cargoHandlerPremiseCode ?? '',
        LMDBusinessCode: jwtAndOrgCodeValue,
      },
      transportDocumentDetails: {
        masterTransportDocNo: movement.mawb,
        transportDocNo: movement.airwayBillNumber,
        cargoType: '1',
        grossWeight:
          Math.floor(movement.packageDetails.grossWeight * 10000) / 10000, //floor down to 4 Decimal places
        grossWeightUOM: movement.packageDetails.grossWeightUOM,
        netWeight:
          Math.floor(movement.packageDetails.netWeight * 10000) / 10000, //floor down to 4 Decimal places
        netWeightUOM: movement.packageDetails.netWeightUOM,
      },
      packageDetails: [
        {
          packageType: movement.packageDetails.packageType ?? '',
          numberOfPackages: Number(movement.packageDetails.numberOfPackages),
          marksAndNumber: '', //Where to retrieve from
          container: [],
        },
      ],
      documents: orderAggregate.order.documents ?? [],
      uuid: uuidv4(),
      jwt: jwtAndOrgCodeValue,
      transportProviderCode: jwtAndOrgCodeValue,
      uuid20: this.generateUUID20(),
      referenceID: movement.referenceID,
      kvp: [],
    };

    const { uuid20, uuid, jwt, ...rest } = payload;

    const footer = await this.generateFooter(
      rest,
      jwtAndOrgCodeValue,
      this.configService.get('HASHICORP_DHL_CODE_LOOKUP') ?? '',
      orderAggregate.order.orderNumber,
      orderAggregate.order.ecomBusinessCode,
    );

    return {
      ...payload,
      ...footer,
    };
  }

  async transformUpdateTransportInfoReturn(
    orderAggregate: {
      order: Order;
      pickupFile: CheckPointFile;
      direction: Direction;
      movementData: Movement;
    },
    returnRequest: ReturnRequest,
  ): Promise<UpdateTransportInfoParameters> {
    const newInvoices = returnRequest.request.invoices.map((inv) => {
      return {
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: new Date(),
        shippingParameterID: '',
      };
    });

    if (!returnRequest.movementData)
      throw new Error('Movementdata not defined');

    const jwtAndOrgCodeValue =
      orderAggregate.order.invoices[0]?.deliveryProviderBusinessCode ?? '';
    const businessAccount =
      EcomBusinessCodeLookup[returnRequest.request.ecomBusinessCode];

    const payload = {
      orderNumber: returnRequest.request.orderNumber,
      shippingParameterId: '',
      ecomOrgCode: returnRequest.request.ecomBusinessCode,
      invoices: newInvoices,
      direction: Direction.Return,
      returnRequestNo: returnRequest.returns[0]?.returnRequestNo,
      oldHouseTransportDocNo: orderAggregate.pickupFile.hawb,
      mode: 'F',
      autoInitiateDeclaration: YesNo.Yes, //TBD
      shippingDetail: {
        shippingAgentBusinessCode: jwtAndOrgCodeValue, //JWT token from business
        modeOfTransport: '8',
        dateOfArrival: DateConverterSlashesToDashes(
          returnRequest.movementData.shippingDetails.dateOfArrival,
        ),
        portOfLoad: returnRequest.movementData.shippingDetails.portOfLoad,
        portOfDischarge: this.checkWhichShipmentValueToUse(
          returnRequest.movementData.shippingDetails.portOfDischarge,
        ),
        originalLoadPort:
          returnRequest.movementData.shippingDetails.originalLoadPort,
        cargoHandlerCode: businessAccount?.cargoHandlerPremiseCode ?? '',
        carrierNumber: returnRequest.movementData.shippingDetails.carrierNumber,
        carrierRegistrationNo:
          returnRequest.movementData.shippingDetails.carrierNumber,
        destinationCountry: findCountryCode(
          returnRequest.movementData.shippingDetails.destinationCountry,
        ),
        LMDBusinessCode: jwtAndOrgCodeValue,
      },
      transportDocumentDetails: {
        masterTransportDocNo: returnRequest.movementData.mawb,
        transportDocNo: returnRequest.movementData.airwayBillNumber,
        cargoType: '1',
        grossWeight:
          Math.floor(
            returnRequest.movementData.packageDetails.grossWeight * 10000,
          ) / 10000, //floor down to 4 Decimal places
        grossWeightUOM:
          returnRequest.movementData.packageDetails.grossWeightUOM,
        netWeight:
          Math.floor(
            returnRequest.movementData.packageDetails.netWeight * 10000,
          ) / 10000, //floor down to 4 Decimal places
        netWeightUOM: returnRequest.movementData.packageDetails.netWeightUOM,
      },
      packageDetails: [
        {
          packageType: returnRequest.movementData.packageDetails.packageType,
          numberOfPackages: Number(
            returnRequest.movementData.packageDetails.numberOfPackages,
          ),
          marksAndNumber: '',
          container: [],
        },
      ],
      documents: [],
      uuid: uuidv4(),
      transportProviderCode: jwtAndOrgCodeValue,
      jwt: jwtAndOrgCodeValue,
      uuid20: this.generateUUID20(),
      referenceID: returnRequest.movementData.referenceID,
      kvp: [],
    };
    const { jwt, uuid20, uuid, ...rest } = payload;
    const footer = await this.generateFooter(
      rest,
      jwtAndOrgCodeValue,
      this.configService.get('HASHICORP_DHL_CODE_LOOKUP') ?? '',
      orderAggregate.order.orderNumber,
      orderAggregate.order.ecomBusinessCode,
    );

    return {
      ...payload,
      ...footer,
    };
  }

  async transformInitiateDeclaration(
    orderAggregate: {
      order: Order;
      direction: Direction;
    },
    invoiceId: string,
  ): Promise<InitiateDeclarationParameters> {
    const invoice = orderAggregate.order?.invoices?.find(
      (i) => i.invoiceNumber === invoiceId,
    );
    if (!invoice) {
      throw Error(`Invoice with id: ${invoiceId} not found`);
    }

    const returnDetail = invoice?.returnDetail;
    const exporterCd = invoice?.exporterCode ?? '';
    const lookUpData = findPaymentModeAndAccountNo(exporterCd);
    const businessAccount =
      EcomBusinessCodeLookup[orderAggregate.order.ecomBusinessCode];

    const payload = {
      uuid: uuidv4(),
      orderNumber: orderAggregate.order.orderNumber,
      ecomOrgCode: invoice.brokerBusinessCode ?? '',
      invoiceNumber: invoice.invoiceNumber,
      shippingParameterID: '',
      direction: orderAggregate.direction,
      returnRequestNo: returnDetail?.returnRequestNo ?? '',
      paymentDetails: [
        {
          paymentMode: lookUpData?.paymentMode ?? '',
          declarationChargesAccount: lookUpData?.accountNo ?? '',
        },
      ],
      tradeType: '1',
      declarationType: 0,
      brokerCustomerCode: businessAccount?.brokerCustomerCode ?? 0,
      prevDeclarationReference: '',
      prevDeclarationInvoiceNo: '',
      prevDeclarationItemLineNo: '',
      declarationDocuments: [
        {
          documentCode: '',
          availabilityStatus: '',
          nonAvailabilityReason: '',
          isDepositCollected: '',
        },
      ],
      invoiceItemLineNo: 0,
      declarantReferenceNo: '',
      kvp: [],
      jwt: invoice.brokerBusinessCode ?? '',
      uuid20: this.generateUUID20(),
    };

    const { uuid20, jwt, uuid, ...rest } = payload;

    const footer = await this.generateFooter(
      rest,
      invoice.brokerBusinessCode ?? '',
      this.configService.get('HASHICORP_DHL_CODE_LOOKUP') ?? '',
      orderAggregate.order.orderNumber,
      orderAggregate.order.ecomBusinessCode,
    );

    return {
      ...payload,
      ...footer,
    };
  }

  async transformReturnDeliverOrder(
    orderAggregate: { order: Order },
    returnRequest: ReturnRequest,
  ): Promise<DeliverOrderParameters> {
    if (
      !returnRequest.pickupFile ||
      !returnRequest.deliveredDate ||
      !returnRequest.deliveredTime
    )
      throw Error(`pickup not defined`);

    const businessAccount =
      EcomBusinessCodeLookup[orderAggregate.order.ecomBusinessCode];

    const jwtAndOrgCodeValue =
      orderAggregate.order.invoices[0]?.deliveryProviderBusinessCode ?? '';
    const payload = {
      orderNumber: returnRequest.request.orderNumber,
      invoiceNumber: returnRequest.request.invoices[0]?.invoiceNumber ?? '',
      transportDocNo: returnRequest.pickupFile.hawb,
      direction: Direction.Return,
      deliveryDate: this.convertISO8061ToDubaiTime(
        returnRequest.deliveredDate,
        false,
      ),
      deliverToPersonName: businessAccount?.businessName ?? '',
      deliveryStatus: returnRequest.deliveredDate ? '1' : '2',
      deliveryType: '1',
      ecomOrgCode: orderAggregate.order.ecomBusinessCode,
      jwt: jwtAndOrgCodeValue,
      signature: {} as DeliverySignature,
      returnToFZorCW: '',
      documents: orderAggregate.order.documents ?? [],
      uuid: uuidv4(),
      signaturePODFilePath: '',
      signaturePODHash: '',
      transportProviderCode: jwtAndOrgCodeValue,
    };

    const { uuid, jwt, ...rest } = payload;
    const footer = await this.generateFooter(
      rest,
      jwtAndOrgCodeValue,
      orderAggregate.order.ecomBusinessCode,
      orderAggregate.order.orderNumber,
      orderAggregate.order.ecomBusinessCode,
    );

    return {
      ...payload,
      epochTimeStamp: footer.epochTimeStamp,
      footerSignature: footer.signature,
      stringifiedPayload: footer.stringifiedPayload,
      orgCode: footer.orgCode,
    };
  }

  async transformDeliverOrder(orderAggregate: {
    order: Order;
    delivered: DeliveredView[];
    direction: Direction;
    pickupFile: CheckPointFile;
  }): Promise<DeliverOrderParameters> {
    const delivered = orderAggregate.delivered.find(
      (x) => x.airwayBillNumber === orderAggregate.pickupFile.hawb,
    );
    const jwtAndOrgCodeValue =
      orderAggregate.order.invoices[0]?.deliveryProviderBusinessCode ?? '';
    const payload = {
      orderNumber: orderAggregate.order.orderNumber,
      invoiceNumber: orderAggregate.order.invoices[0]?.invoiceNumber ?? '',
      transportDocNo: orderAggregate.pickupFile.hawb ?? '',
      direction: orderAggregate.direction,
      deliveryDate: delivered?.deliveryDate
        ? this.convertISO8061ToDubaiTime(
            delivered.deliveryDate.toString(),
            false,
          )
        : '',
      deliverToPersonName: orderAggregate.order.shipTo ?? '',
      deliveryStatus: delivered?.deliveryCode
        ? delivered.deliveryCode === 'OK'
          ? '1'
          : '2'
        : '',
      deliveryType: '1',
      ecomOrgCode: orderAggregate.order.ecomBusinessCode,
      jwt: jwtAndOrgCodeValue,
      signature: {} as DeliverySignature,
      returnToFZorCW: '',
      documents: orderAggregate.order.documents ?? [],
      uuid: uuidv4(),
      signaturePODFilePath: '',
      signaturePODHash: '',
      transportProviderCode: jwtAndOrgCodeValue,
    };

    const { uuid, jwt, ...rest } = payload;

    const footer = await this.generateFooter(
      rest,
      jwtAndOrgCodeValue,
      this.configService.get('HASHICORP_DHL_CODE_LOOKUP') ?? '',
      orderAggregate.order.orderNumber,
      orderAggregate.order.ecomBusinessCode,
    );
    return {
      ...payload,
      epochTimeStamp: footer.epochTimeStamp,
      footerSignature: footer.signature,
      stringifiedPayload: footer.stringifiedPayload,
      orgCode: footer.orgCode,
    };
  }

  async transformConfirmReturnDelivery(
    orderAggregate: {
      order: Order;
    },
    confirmReturnDelivery: ConfirmReturnDelivery,
  ): Promise<ConfirmReturnDeliveryParameters> {
    const jwtAndOrgCodeValue =
      orderAggregate.order.invoices[0]?.logisticsSPBusinessCode ?? '';

    let result;

    if (confirmReturnDelivery.gatePasses) {
      result = confirmReturnDelivery.gatePasses?.map((data) => {
        return {
          gatePassNumber: data.gatePassNumber,
          gatePassDirection: data.gatePassDirection,
          actualMovingInDate: data.ActualMovingInDate,
        };
      });
    }

    const payload = {
      orderNumber: orderAggregate.order.orderNumber,
      invoiceNumber: confirmReturnDelivery.invoiceNumber,
      transportDocNo: confirmReturnDelivery.transportDocNo ?? '',
      returnRequestNo: confirmReturnDelivery.returnRequestNo,
      gatePasses: result,
      dateOfReceivingBackGoods: confirmReturnDelivery.dateOfReceivingBackGoods,
      lineItems: confirmReturnDelivery.lineItems,
      ecomOrgCode: orderAggregate.order.ecomBusinessCode,
      uuid: uuidv4(),
      jwt: jwtAndOrgCodeValue,
      uuid20: this.generateUUID20(),
      kvp: confirmReturnDelivery.kvp ? confirmReturnDelivery.kvp : [],
      transportProviderCode: confirmReturnDelivery.transportProviderCode ?? '',
    };
    const { kvp, uuid20, uuid, jwt, ...rest } = payload;
    const footer = await this.generateFooter(
      rest,
      jwtAndOrgCodeValue,
      this.configService.get('HASHICORP_DHL_CODE_LOOKUP') ?? '',
      orderAggregate.order.orderNumber,
      orderAggregate.order.ecomBusinessCode,
    );
    return {
      ...payload,
      ...footer,
    };
  }

  async transformUpdateExitConfirmation(
    orderAggregate: {
      order: Order;
      movementData: Movement;
      pickupFile: CheckPointFile;
    },
    declarationNumber: string,
  ): Promise<UpdateExitConfirmationParameters> {
    const order = orderAggregate.order;
    const orderInvoice = order.invoices[0];
    const jwtAndOrgCodeValue = orderInvoice?.deliveryProviderBusinessCode ?? '';
    const movement = orderAggregate.movementData.shippingDetails;
    const exporterCd = orderInvoice?.exporterCode ?? '';

    // Options 3 is applicable based on given logic
    const mapping = businessCodeAccountNoMapping[3];
    this.logger.debug(`exit confirmation data transformer`);
    this.logger.debug(
      `date: ${movement.dateOfDeparture}, time: ${movement.timeOfDeparture}, offset: ${movement.movementGMT}`,
    );
    const actualDepartureDate = DateTimeOffsetToDubaiTime(
      movement.dateOfDeparture,
      movement.timeOfDeparture,
      movement.movementGMT,
    );
    this.logger.debug(`stringified: ${actualDepartureDate}`);

    const payload = {
      uuid: uuidv4(),
      transportDocNo: orderAggregate.pickupFile.hawb,
      referenceID: uuidv4(),
      transportProviderCode: jwtAndOrgCodeValue,
      exitData: [
        {
          declarationNo: declarationNumber,
          actualDepartureDate:
            actualDepartureDate && actualDepartureDate !== 'Invalid Date'
              ? actualDepartureDate
              : '10/10/2021 06:16:14',
          carrierNumber: movement.carrierNumber,
          pointOfExit: movement.pointOfExit,
          debitCreditAccountNo:
            exporterCd == mapping.businessCode ? mapping.accountNo : '',
        },
      ],
      kvp: order.__kvp ?? [],
      jwt: jwtAndOrgCodeValue,
      uuid16: uuidv4(),
    };

    const { kvp, jwt, uuid16, uuid, ...rest } = payload;
    const footer = await this.generateFooter(
      rest,
      jwtAndOrgCodeValue,
      this.configService.get('HASHICORP_DHL_CODE_LOOKUP') ?? '',
      orderAggregate.order.orderNumber,
      orderAggregate.order.ecomBusinessCode,
    );
    return {
      ...payload,
      ...footer,
    };
  }

  private checkWhichShipmentValueToUse(shipmentValue: string): string {
    const DO4Values = ['ZJF', 'AUH', 'DXH', 'DXB', 'SHJ', 'RAK'];
    if (DO4Values.includes(shipmentValue)) {
      return 'D04';
    } else {
      return findCountryCode(shipmentValue);
    }
  }

  private convertISO8061ToDubaiTime(
    date: string | undefined,
    includeTime: boolean,
  ): string {
    if (!date) return '';
    const dateTime = new Date(date)
      .toLocaleString('en-US', { timeZone: 'Asia/Dubai', hour12: false })
      .split(', ');

    if (!dateTime || !dateTime[0] || !dateTime[1]) return '';

    const monthDayYear = dateTime[0].split('/');
    const hourMinSec = dateTime[1]?.split(':');

    if (includeTime)
      return `${monthDayYear[1].padStart(2, '0')}/${monthDayYear[0].padStart(
        2,
        '0',
      )}/${monthDayYear[2].padStart(2, '0')} ${hourMinSec[0].padStart(
        2,
        '0',
      )}:${hourMinSec[1].padStart(2, '0')}:${hourMinSec[2].padStart(2, '0')}`;
    // MM-DD-YYYY HH:MM:SS
    else
      return `${monthDayYear[2].padStart(2, '0')}-${monthDayYear[0].padStart(
        2,
        '0',
      )}-${monthDayYear[1].padStart(2, '0')}`; // YYYY-MM-DD
  }

  public getUtcTimeStamp(inputDate?: string): string {
    let date = new Date();
    if (inputDate) date = new Date(inputDate);
    return date.getTime().toString();
  }

  private async generateFooter(
    payload: any,
    orgCode: string,
    vaultKey: string,
    orderNumber: string,
    ecomBusinessCode: string,
  ) {
    const signature = await this.getSignature(
      JSON.stringify(payload),
      vaultKey,
      orderNumber,
      ecomBusinessCode,
    );
    return {
      epochTimeStamp: this.getUtcTimeStamp(),
      signature,
      stringifiedPayload: {
        ...payload,
      },
      orgCode,
    };
  }

  private async getSignature(
    payload: string,
    vaultCode: string,
    orderNumber: string,
    ecomBusinessCode: string,
  ): Promise<string> {
    const sharedKeyLookup =
      this.configService.get('HASHICORP_SHARED_KEY_LOOKUP') ?? 'shared';
    let secrets = this.secretsService.getSecretsFromMemory();
    let sharedSecret = secrets[sharedKeyLookup];
    let privateKey = secrets[vaultCode];

    if (!privateKey)
      this.logger.error(`Private key not found for ${vaultCode}`);
    if (!sharedSecret) this.logger.error(`Shared secret not found`);

    if (!privateKey || !sharedSecret) {
      this.logger.warn(
        `Vault private key(s) not found. Refetching all private keys from HashiCorp Vault.`,
      );
      await this.secretsService.fetchSecretsFromHashiCorpVault();
      secrets = this.secretsService.getSecretsFromMemory();
      privateKey = secrets[vaultCode];
      sharedSecret = secrets[sharedKeyLookup];
      if (!privateKey || !sharedSecret) {
        this.logger.error(
          `Vault private key(s) still not found after refetch. Sending error to Bless.`,
        );
        await this.postErrorToBless(
          404,
          `Private key not found in HashiCorp Vault for private key identifier ${vaultCode}`,
          orderNumber,
          ecomBusinessCode,
        );
      } else {
        this.logger.log(
          `Missing private key(s) successfully refetched from HashiCorp Vault`,
        );
      }
    }
    return this.generateSignature(privateKey, payload, sharedSecret);
  }

  private getJwtOrOrgCode(submitOrder: SubmitOrder): string {
    if (submitOrder.mode === ModeType.Basic) {
      return submitOrder.invoices[0]?.exporterCode ?? '';
    }
    return submitOrder.invoices[0]?.logisticsSPBusinessCode ?? '';
  }

  private generateUUID20(): string {
    return uuidv4().replace('-', '').slice(0, 20);
  }

  private generateSignature(
    privateKey: string,
    payload: string,
    sharedSecret: string,
  ): string {
    try {
      const hash = crypto
        .createHmac('sha512', sharedSecret)
        .update(payload)
        .digest();

      const signer = crypto.createSign('RSA-SHA512');
      signer.write(hash);
      signer.end();

      return signer.sign(
        {
          key: privateKey,
        },
        'hex',
      );
    } catch (error) {
      this.logger.error(
        'Creation of signature went wrong, defaulting to empty string. Error: ' +
          error,
      );
      return '';
    }
  }

  private async postErrorToBless(
    errorCode: number,
    errorMessage: string,
    orderNumber: string,
    ecomBusinessCode: string,
  ): Promise<void> {
    const errorMessagePayload: ErrorMessagePayloadModel = {
      id: uuidv4(),
      errorCode: errorCode.toString(),
      dateTime: Date.now().toString(),
      errorDesc: errorMessage,
      msgIdentifier: {
        orderNumber: orderNumber,
        ecomBusinessCode: ecomBusinessCode,
      },
    };
    await this.blessClientService.post(
      errorMessagePayload,
      'EXCEPTION',
      'BUSINESS',
    );
  }
}
