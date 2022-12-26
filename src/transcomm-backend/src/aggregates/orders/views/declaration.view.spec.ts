import { OrderAggregate } from '../order-aggregate';
import { DeclarationView } from './declaration.view';
import { mockClaim, mockClaimRequest, mockDeclaration, mockSubmitOrder } from './__mocks__/order.mock';

describe('DeclarationView', () => {
  it('should be defined', () => {
    expect(new DeclarationView()).toBeDefined();
  });

  it('should generate declarations (no claim)', () => {
    const aggregate = new OrderAggregate('test');
    const declarationView = new DeclarationView();
    aggregate.submitOrder(mockSubmitOrder);
    aggregate.order.invoices[0].declarations = [mockDeclaration];
    const result = declarationView.HydrateDeclarations(aggregate.order);

    expect(result.length).toBe(1);
    expect(result[0].claim).toBeUndefined();
  });

  it('should generate declarations (with claim)', () => {
    const aggregate = new OrderAggregate('test');
    const declarationView = new DeclarationView();
    aggregate.submitOrder(mockSubmitOrder);
    const declaration = { ...mockDeclaration };
    declaration.claim = mockClaim;
    declaration.claimRequest = mockClaimRequest;
    aggregate.order.invoices[0].declarations = [declaration];
    const result = declarationView.HydrateDeclarations(aggregate.order);

    expect(result.length).toBe(1);
    expect(result[0].claim).toBeDefined();
  });
});
