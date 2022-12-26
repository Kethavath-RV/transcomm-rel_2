import { BadRequestException, NotFoundException } from '@nestjs/common';

export function prismaErrorHandler(error) {
  if (error.code === 'P2025') {
    throw new NotFoundException();
  } else {
    throw new BadRequestException(error.message);
  }
}
