export type PrismaWhereInput = {
  AND?: PrismaWhereInput[];
  OR?: PrismaWhereInput[];
  NOT?: PrismaWhereInput[];
  [field: string]:
    | SearchTypeText
    | SearchTypeNumber
    | SearchTypeEnum
    | SearchTypeDate
    | PrismaWhereInput[];
};

export type PrismaOrderByInput = {
  [field: string]: SortOrder;
};

export type ApiDataParams = {
  newPage: number;
  searchParams: PrismaWhereInput;
  sortParams: PrismaOrderByInput[];
};

export type FilterCondtional = 'single' | 'AND' | 'OR';

export type DateFilterModelType = {
  type: FilterCondtional;
  condition1: SearchDateConverterType;
  condition2?: SearchDateConverterType;
  isDate: true;
};

export type GenericFilterModelType = {
  type: FilterCondtional;
  condition1: SearchTypeText | SearchTypeNumber;
  condition2?: SearchTypeText | SearchTypeNumber;
  isDate: false;
};

export type FilterModelType = GenericFilterModelType | DateFilterModelType;

/* sort section */
const SortOrder = {
  asc: 'asc',
  desc: 'desc',
};
type SortOrder = typeof SortOrder[keyof typeof SortOrder];

/* filter section */
export interface SearchTypeText {
  contains?: string;
  equals?: string;
  not?: string;
  startsWith?: string;
  endsWith?: string;
}

export type SearchTypeNumber = {
  equals?: number;
  not?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
};

export type SearchTypeEnum = {
  equals?: string;
  in?: string[];
  notIn?: string[];
  not?: string;
};

export type SearchTypeDate = {
  lt?: Date | string;
  gt?: Date | string;
};

export type SearchDateConverterType = {
  AND: SearchTypeDate[];
};
