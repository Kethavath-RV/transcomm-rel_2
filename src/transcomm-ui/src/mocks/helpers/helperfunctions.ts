import { Paginated } from 'core/viewModels';

export function paginateHelper<T>(inputData: T[]): Paginated<T> {
  return {
    data: inputData,
    numberOfRecords: inputData.length,
  };
}

export const compareFunction = (
  a: unknown,
  b: unknown,
  dir: string,
  key: string,
): number => {
  if (dir === 'asc') {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  } else {
    if (a[key] < b[key]) return 1;
    if (a[key] > b[key]) return -1;
    return 0;
  }
};

export const noUnusedFields = (a: unknown[], b: unknown[]): boolean => {
  const unionOfArrays = new Set([...a, ...b]);
  return unionOfArrays.size === Math.max(a.length, b.length);
};
