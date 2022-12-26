import { ICellRendererParams } from '@ag-grid-community/core';
import { FilterCondtional } from './prismaModels';

export interface UpdatedICellRendererParams extends ICellRendererParams {
  clicked: (row: number) => void;
}

export function isValidCondition(
  condition: string,
): condition is FilterCondtional {
  switch (condition) {
    case 'single':
    case 'AND':
    case 'OR':
      return true;
    default:
      return false;
  }
}
