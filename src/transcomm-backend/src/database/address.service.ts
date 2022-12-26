import { Injectable } from '@nestjs/common';
import { Prisma, Address, PrismaPromise } from '@prisma/client';
import { DatabaseService } from './database.service';

@Injectable()
export class AddressService {
  constructor(private prisma: DatabaseService) {}

  async order(
    addressUniqueInput: Prisma.AddressWhereUniqueInput,
  ): Promise<Address | null> {
    return this.prisma.address.findUnique({
      where: addressUniqueInput,
    });
  }

  async addresses(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AddressWhereUniqueInput;
    where?: Prisma.AddressWhereInput;
    orderBy?: Prisma.AddressOrderByInput;
  }): Promise<Address[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.address.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async deleteAddress(where: Prisma.AddressWhereUniqueInput): Promise<Address> {
    return this.prisma.address.delete({
      where,
    });
  }

  async createAddress(
    data: Prisma.AddressCreateInput,
  ): Promise<PrismaPromise<Address>> {
    return this.prisma.address.create({
      data,
    });
  }
}
