import { Prisma } from '@prisma/client';
import { declarationType, ModeType, ReturnRequest } from 'core';
import { OrderAggregate } from '../order-aggregate';
import { OverviewView } from './overview.view';
import { mockSubmitOrder } from './__mocks__/order.mock';

describe('OverviewView', () => {
  it('should be defined', () => {
    expect(new OverviewView()).toBeDefined();
  });

  it('should generate order overview', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;

    const overviewView = new OverviewView();

    const result = overviewView.HydrateOrderOverviews(aggregate.order, aggregate);
    expect(result.length).toBe(aggregate.order.invoices.length);
  });

  it('should not generate cancel order overview (wrong status - no overviews)', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;

    const overviewView = new OverviewView();

    const result = overviewView.HydrateCancelOrderOverviews(aggregate, aggregate.order);
    expect(result.length).toBe(0);
  });

  it('should generate cancel order overview', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.status = 'OrderCancelled';

    const overviewView = new OverviewView();

    const result = overviewView.HydrateCancelOrderOverviews(aggregate, aggregate.order);
    expect(result.length).toBe(aggregate.order.invoices.length);
  });

  it('should generate exception order overview', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.status = 'OrderCancelled';
    const declaration: Prisma.DeclarationCreateWithoutOrderInput = {
      declarationNumber: '',
      hyperledgerKey: '',
      clearanceStatus: declarationType["16"],
      invoiceNumber: mockSubmitOrder.invoices[0].invoiceNumber
    };
    const declarations: Prisma.DeclarationCreateWithoutOrderInput[] = [
      declaration
    ]
    const overviewView = new OverviewView();

    const result = overviewView.HydrateExceptionOverview(aggregate.order, aggregate, declarations);
    expect(result.length).toBe(aggregate.order.invoices.length);
  });

  it('should not generate exception order overview if cant find invoice', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.status = 'OrderCancelled';
    const declaration: Prisma.DeclarationCreateWithoutOrderInput = {
      declarationNumber: '',
      hyperledgerKey: '',
      clearanceStatus: declarationType["16"],
      invoiceNumber: 'random',
    };
    const declarations: Prisma.DeclarationCreateWithoutOrderInput[] = [
      declaration
    ]
    const overviewView = new OverviewView();

    const result = overviewView.HydrateExceptionOverview(aggregate.order, aggregate, declarations);
    expect(result.length).toBe(0);
  });

  it('should not generate exception order overview wrong status', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.status = 'OrderCancelled';
    const declaration: Prisma.DeclarationCreateWithoutOrderInput = {
      declarationNumber: '',
      hyperledgerKey: '',
      clearanceStatus: declarationType["6"],
      invoiceNumber: mockSubmitOrder.invoices[0].invoiceNumber,
    };
    const declarations: Prisma.DeclarationCreateWithoutOrderInput[] = [
      declaration
    ]
    const overviewView = new OverviewView();

    const result = overviewView.HydrateExceptionOverview(aggregate.order, aggregate, declarations);
    expect(result.length).toBe(0);
  });

  it('should not generate exception order overview no declarations', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.status = 'OrderCancelled';
    const overviewView = new OverviewView();

    const result = overviewView.HydrateExceptionOverview(aggregate.order, aggregate, []);
    expect(result.length).toBe(0);
  });

  it('should generate return overview', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.status = 'OrderCancelled';
    const overviewView = new OverviewView();

    const returnRequest: ReturnRequest = {
      request: {
        actionDate: new Date().toISOString(),
        ecomBusinessCode: '',
        invoices: [],
        mode: ModeType.Final,
        orderNumber: 'test'
      },
      vcId: '',
      actionDate: '',
      returns: [
        {
          exporterCode: '',
          invoiceNumber: '',
          lineItems: [],
          returnRequestNo: '',
        }
      ],
      processed: false,
      submitted: false,
      updatedShipping: false,
      delivered: false
    }
    aggregate.returns = [
      returnRequest
    ];

    const result = overviewView.HydrateReturnOverviews(aggregate);
    expect(result.length).toBe(returnRequest.returns.length);
  });
});
