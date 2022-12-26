import { Prisma } from '@prisma/client';

export class OrderQueryRequestDto {
  searchParams?: Prisma.OrderOverviewWhereInput;
  sortParams?:
    | Prisma.OrderOverviewOrderByInput
    | Prisma.OrderOverviewOrderByInput[];
}
