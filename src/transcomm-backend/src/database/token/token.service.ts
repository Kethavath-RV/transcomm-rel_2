import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken } from '@prisma/client';
import { DatabaseService } from 'database/database.service';

@Injectable()
export class TokenService {
  constructor(private prisma: DatabaseService) {}

  findToken(
    token: Prisma.RefreshTokenWhereUniqueInput,
  ): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: token });
  }

  tokenExists(token: Prisma.RefreshTokenWhereUniqueInput): Promise<number> {
    return this.prisma.refreshToken.count({ where: token });
  }
  removeToken(
    token: Prisma.RefreshTokenWhereUniqueInput,
  ): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.delete({ where: token });
  }

  async removeRefreshTokenForUser(userId: string): Promise<number> {
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: { userId: userId },
    });
    return count;
  }

  async createToken(
    token: Prisma.RefreshTokenCreateWithoutUserInput,
    userId: string,
  ): Promise<RefreshToken | null> {
    return await this.prisma.refreshToken.create({
      data: {
        ...token,
        user: {
          connect: { id: userId },
        },
      },
    });
  }
}
