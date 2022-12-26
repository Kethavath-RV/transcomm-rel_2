import {
  DetailMovement,
  DHLEDeclarationRequest,
  MasterMovement,
  ReturnRequest,
  SubmitOrder,
} from 'core';
import { mockDeep } from 'jest-mock-extended';
import { OrderAggregate } from '../order-aggregate';
import { MovementView } from './movement.view';

const mockSubmitOrder = mockDeep<SubmitOrder>();
const mockMasterMovement = mockDeep<MasterMovement>();
const mockDetailMovement = mockDeep<DetailMovement>();
const mockReturnRequest = mockDeep<ReturnRequest>();
const mockDeclarationRequest = mockDeep<DHLEDeclarationRequest>();

describe('MovementView', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(new MovementView()).toBeDefined();
  });

  it('should hydrate movements (no returns)', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.processMasterMovementFile(
      mockMasterMovement,
      mockMasterMovement.mawbNumber,
    );
    aggregate.processDetailMovement(mockDetailMovement);

    const movementView = new MovementView();
    const result = movementView.HydrateMovements(aggregate);

    expect(result.length).toBe(1);
    expect(result[0].mawb).toBe(mockMasterMovement.mawbNumber);
  });

  it('should hydrate movements (with returns)', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.processMasterMovementFile(
      mockMasterMovement,
      mockMasterMovement.mawbNumber,
    );
    aggregate.processDetailMovement(mockDetailMovement);
    aggregate.returns = [mockReturnRequest];

    const movementView = new MovementView();
    const result = movementView.HydrateMovements(aggregate);

    expect(result.length).toBe(2);
    expect(result[0].mawb).toBe(mockMasterMovement.mawbNumber);
  });

  it('should hydrate movements (with returns - no details)', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.processMasterMovementFile(
      mockMasterMovement,
      mockMasterMovement.mawbNumber,
    );
    aggregate.returns = [mockReturnRequest];

    const movementView = new MovementView();
    const result = movementView.HydrateMovements(aggregate);

    expect(result.length).toBe(2);
  });

  it('should hydrate movements (with returns - no details or master)', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.returns = [mockReturnRequest];

    const movementView = new MovementView();
    const result = movementView.HydrateMovements(aggregate);

    expect(result.length).toBe(0);
  });

  it('should hydrate movements via declaration request (no returns)', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;
    aggregate.processDeclarationRequest(mockDeclarationRequest);

    const movementView = new MovementView();
    const result = movementView.HydrateMovements(aggregate);

    expect(result.length).toBe(1);
  });
});
