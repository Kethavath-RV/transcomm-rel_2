import { ColumnState } from '@ag-grid-community/core';
import {
  DateFilterModelType,
  FilterModelType,
  GenericFilterModelType,
  PrismaOrderByInput,
  PrismaWhereInput,
  SearchTypeDate
} from '../models/prismaModels';

function dateFilterHandler(
  currentFilter: DateFilterModelType,
  key: string,
  prismaFilter: PrismaWhereInput,
): void {
  const condition1Array: SearchTypeDate[] = currentFilter.condition1.AND;
  const condition2Array: SearchTypeDate[] = currentFilter.condition2.AND;

  const condition1WithKeys = [] as PrismaWhereInput[];
  condition1Array.forEach((condition) => {
    condition1WithKeys.push({ [key]: condition });
  });
  const condition2WithKeys = [] as PrismaWhereInput[];
  condition2Array.forEach((condition) => {
    condition2WithKeys.push({ [key]: condition });
  });

  if (currentFilter.type === 'single') {
    prismaFilter['AND'] = [...prismaFilter.AND, ...condition1WithKeys];
  } else if (currentFilter.type === 'AND') {
    prismaFilter['AND'] = [
      ...prismaFilter.AND,
      ...condition1WithKeys,
      ...condition2WithKeys,
    ];
  } else {
    const conditionsToBeAdded = [
      { AND: condition1WithKeys },
      { AND: condition2WithKeys },
    ];
    prismaFilter['AND'] = [...prismaFilter.AND, { OR: conditionsToBeAdded }];
  }
}

function genericFilterHandler(
  currentFilter: GenericFilterModelType,
  key: string,
  prismaFilter: PrismaWhereInput,
): void {
  const condition1 = currentFilter.condition1;
  const condition2 = currentFilter.condition2;

  if (currentFilter.type === 'single') {
    prismaFilter[key] = condition1;
  } else {
    const conditionsToBeAdded = [{ [key]: condition1 }, { [key]: condition2 }];
    if (currentFilter.type === 'AND') {
      prismaFilter['AND'] = [...prismaFilter.AND, ...conditionsToBeAdded];
    } else {
      prismaFilter['AND'] = [...prismaFilter.AND, { OR: conditionsToBeAdded }];
    }
  }
}

/**
 * Filters and sorts the aggrid columns into a prisma readable format
 *
 * @param columnModel
 * @returns
 */

export const prismaSortBuilder = (
  columnModel: ColumnState[],
): PrismaOrderByInput[] => {
  const prismaSort: PrismaOrderByInput[] = [];

  columnModel.forEach((column) => {
    const { sort, sortIndex, colId } = column;
    if (sort) {
      prismaSort[sortIndex] = { [colId]: sort };
    }
  });

  return prismaSort;
};

/**
 * Translates the data provided by the custom aggrid filter to a prisma readable format
 *
 * @param filterModel
 * @returns
 */
export const prismaFilterBuilder = (filterModel: {
  [key: string]: FilterModelType;
}): PrismaWhereInput => {
  const filterModelKeys = Object.keys(filterModel);
  if (!filterModel || filterModelKeys.length === 0) {
    return {};
  }

  const prismaFilter: PrismaWhereInput = { AND: [] };
  filterModelKeys.forEach((key: string) => {
    const currentFilter: FilterModelType = filterModel[key];
    if (currentFilter.isDate) {
      dateFilterHandler(currentFilter, key, prismaFilter);
    } else {
      genericFilterHandler(
        currentFilter as GenericFilterModelType,
        key,
        prismaFilter,
      );
    }
  });

  return prismaFilter;
};
