import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { PerformDetailToOrderIdLookupCommand } from 'aggregates/airwayNumToOrderIdLookup/commands/impl/perform-detail-lookup';
import { DetailMovement } from 'core';
import { mock } from 'jest-mock-extended';
import { IncomingDetailMovementFileEvent } from '../impl/incoming-detail-movement-file.event';
import { IncomingDetailMovementFileHandler } from './incoming-detail-movement-file.handler';

const mawbNumber = 'test-mawb-number-1';
const airwayBillNo = 'test-airwaybillno-1';

const detailMovement: DetailMovement = {
  airwayBillNumber: airwayBillNo,
  handlingUnitNumber: '',
  consigneeCountryCode: '',
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

describe('EventHandlers for mawbAirwayNumsLookup aggregate', () => {
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

  it('IncomingDetailMovementFileEvent triggers PerformDetailToOrderIdLookupCommand', async () => {
    jest.spyOn(commandBus, 'execute').mockImplementation(async (command) => {
      const performDetailToOrderIdLookupCommand =
        command as PerformDetailToOrderIdLookupCommand;
      expect(command).toBeInstanceOf(PerformDetailToOrderIdLookupCommand);
      expect(performDetailToOrderIdLookupCommand.airwayBillNumber).toBe(
        airwayBillNo,
      );
    });
    const event = new IncomingDetailMovementFileEvent(
      mawbNumber,
      detailMovement,
    );
    const eventHandler = new IncomingDetailMovementFileHandler(commandBus);
    eventHandler.handle(event);
  });
});
