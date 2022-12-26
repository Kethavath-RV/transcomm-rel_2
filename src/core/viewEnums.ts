export type OrderStatus =
  | 'OrderCreated'
  | 'Submitted'
  | 'InTransit'
  | 'Cleared'
  | 'Delivered'
  | 'Undelivered'
  | 'OrderCancelled'
  | 'Final'
  | 'ReturnCreated'
  | 'ReturnReceipt'
  | 'GoodsMoveOutofUAE';

export const OrderStatus: {
  Submitted: 'Submitted';
  OrderCreated: 'OrderCreated';
  InTransit: 'InTransit';
  Cleared: 'Cleared';
  Delivered: 'Delivered';
  Undelivered: 'Undelivered';
  OrderCancelled: 'OrderCancelled';
  Final: 'Final';
  ReturnCreated: 'ReturnCreated';
  ReturnReceipt: 'ReturnReceipt';
  GoodsMoveOutofUAE: 'GoodsMoveOutofUAE';
} = {
  Submitted: 'Submitted',
  OrderCreated: 'OrderCreated',
  InTransit: 'InTransit',
  Cleared: 'Cleared',
  Delivered: 'Delivered',
  Undelivered: 'Undelivered',
  OrderCancelled: 'OrderCancelled',
  Final: 'Final',
  ReturnCreated: 'ReturnCreated',
  ReturnReceipt: 'ReturnReceipt',
  GoodsMoveOutofUAE: 'GoodsMoveOutofUAE',
};

export type UserRole = 'viewer' | 'editor' | 'admin' | 'super_admin';
export const UserRole: {
  viewer: 'viewer';
  editor: 'editor';
  admin: 'admin';
  super_admin: 'super_admin';
} = {
  viewer: 'viewer',
  editor: 'editor',
  admin: 'admin',
  super_admin: 'super_admin',
};

export type PartyType = 'receiver' | 'sender';
export const PartyType: {
  receiver: 'receiver';
  sender: 'sender';
} = {
  receiver: 'receiver',
  sender: 'sender',
};
