import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from './database.service';

@Injectable()
export class HouseBillService {
  constructor(private prisma: DatabaseService) {}

  async createHouseBill(
    data: Prisma.HouseBillCreateManyInput,
  ): Promise<Prisma.BatchPayload> {
    const result = await this.prisma.houseBill.createMany({
      data,
    });
    return result;
  }
}
