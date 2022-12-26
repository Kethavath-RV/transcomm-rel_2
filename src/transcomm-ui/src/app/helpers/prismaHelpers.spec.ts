import { ColumnState } from '@ag-grid-community/core';
import {
  FilterModelType,
  PrismaOrderByInput,
  PrismaWhereInput
} from '../models/prismaModels';
import { prismaFilterBuilder, prismaSortBuilder } from './prismaHelpers';

const columnStateArray: ColumnState[] = [
  {
    colId: 'field1',
  },
  {
    colId: 'field2',
    sort: 'asc',
    sortIndex: 1,
  },
  {
    colId: 'field3',
    sort: 'desc',
    sortIndex: 0,
  },
];

const sortedPrismaArray: PrismaOrderByInput[] = [
  {
    field3: 'desc',
  },
  {
    field2: 'asc',
  },
];

const filterModel: {
  [field: string]: FilterModelType;
} = {
  field1: {
    type: 'single',
    condition1: { contains: 'a' },
    isDate: false,
  },
  field2: {
    type: 'AND',
    condition1: { contains: 'a' },
    condition2: { contains: 'b' },
    isDate: false,
  },
  field3: {
    type: 'OR',
    condition1: { contains: 'a' },
    condition2: { contains: 'b' },
    isDate: false,
  },
};
const prismaFilterModel: PrismaWhereInput = {
  field1: { contains: 'a' },
  AND: [
    { field2: { contains: 'a' } },
    { field2: { contains: 'b' } },
    { OR: [{ field3: { contains: 'a' } }, { field3: { contains: 'b' } }] },
  ],
};

describe('Prisma Helpers', () => {
  describe('prismaSortBuilder', () => {
    it('should work in no data case', () => {
      const test = prismaSortBuilder([]);
      expect(test).toEqual([]);
    });

    it('creates prisma readable array for sort data', () => {
      const test = prismaSortBuilder(columnStateArray);
      expect(test).toEqual(sortedPrismaArray);
    });
  });

  describe('prismaFilterBuilder', () => {
    // cases to test, multiple AND/OR conditions, empty, null etc
    it('should  work in no data case', () => {
      const test = prismaFilterBuilder({});
      expect(test).toEqual({});
    });

    it('should create a prisma acceptable filter', () => {
      const test = prismaFilterBuilder(filterModel);
      expect(test).toEqual(prismaFilterModel);
    });
  });
});
