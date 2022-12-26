import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class UserQueryRequestDto {
  @IsOptional()
  searchParams?: Prisma.UserWhereInput;
  @IsOptional()
  sortParams?: Prisma.UserOrderByInput | Prisma.UserOrderByInput[];
}
