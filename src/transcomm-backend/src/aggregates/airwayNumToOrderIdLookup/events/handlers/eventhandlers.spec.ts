import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ProcessDetailMovementFileCommand } from 'aggregates/orders/commands/impl/process-detail-movement-file';
import { ProcessMasterMovementFileCommand } from 'aggregates/orders/commands/impl/process-master-movement-file';
import { DetailMovement, MasterMovement, UnitOfMeasurement } from 'core';
import { mock } from 'jest-mock-extended';
import { IncomingDetailMovementEvent } from '../impl/incoming-detail-movement.event';
import { IncomingMasterMovementFileEvent } from '../impl/incoming-master-movement-file.event';
import { IncomingDetailMovementHandler } from './incoming-detail-movement.handler';
import { IncomingMasterMovementFileHandler } from './incoming-master-movement-file.handler';

const mawbNumber = 'test-mawb-number';
const orderId = 'test-order-id';
const ecomBusinessCode = 'test-ecomCode-id';

const masterMovement: MasterMovement = {
  movementDepartureDate: '',
  movementDepartureTime: '',
  movementGMT: '',
  mawbNumber: mawbNumber,
  weightUnit: UnitOfMeasurement.Kilogram,
  handlingUnits: {
    handlingUnitNumber: '',
    handlingUnitParent: '',
    handlingUnitRegNumber: '',
    handlingUnitType: '',
  },
  movementNumber: '',
  movementOrigin: '',
  movementOriginCountry: '',
  movementDestination: ''
};

const detailMovement: DetailMovement = {
  airwayBillNumber: '',
  consigneeCountryCode: '',
  handlingUnitNumber: '',
  incoterm: '',
  item: { unitOfMeasure: '' },
  mawbNumber: mawbNumber,
  shipmentActualWeight: 0,
  shipmentDeclaredVolumeWeight: 0,
  shipmentDestination: '',
  shipmentOrigin: '',
  shipmentOriginCountry: '',
  shipmentTotalVolumeMetricWeight: 0,
  shipmentWeight: 0,
  shipperRef: [],
  totalPiecesInShipment: 0,
};

describe('EventHandlers for airwayNumToOrderIdLookup aggregate', () => {
  const commandBus = mock<CommandBus>();

  beforeAll(async () => {
    // Provide a logger wihout output
    await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: {
            log: jest.fn(() => {
              return;
            }),
            error: jest.fn(() => {
              return;
            }),
          },
        },
      ],
    }).compile();
  });

  // Tests
  it('IncomingDetailMovementEvent triggers ProcessDetailMovementFileCommand', async () => {
    jest.spyOn(commandBus, 'execute').mockImplementation(async (command) => {
      const processDetailMovementFileCommand =
        command as ProcessDetailMovementFileCommand;
      expect(command).toBeInstanceOf(ProcessDetailMovementFileCommand);
      expect(processDetailMovementFileCommand.orderId).toBe(orderId);
    });
    const event = new IncomingDetailMovementEvent(
      mawbNumber,
      orderId,
      ecomBusinessCode,
      detailMovement,
    );
    const eventHandler = new IncomingDetailMovementHandler(commandBus);
    eventHandler.handle(event);
  });

  it('can handle order created event', async () => {
    jest.spyOn(commandBus, 'execute').mockImplementation(async (command) => {
      const processMasterMovementFileCommand =
        command as ProcessMasterMovementFileCommand;
      expect(command).toBeInstanceOf(ProcessMasterMovementFileCommand);
      expect(processMasterMovementFileCommand.orderId).toBe(orderId);
    });
    const event = new IncomingMasterMovementFileEvent(
      mawbNumber,
      orderId,
      ecomBusinessCode,
      masterMovement,
    );
    const eventHandler = new IncomingMasterMovementFileHandler(commandBus);
    eventHandler.handle(event);
  });
});
