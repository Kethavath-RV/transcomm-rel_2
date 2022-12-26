import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { Paginated } from 'core';
import { ParsePaginationPipe } from 'helpers/nestPipes';
import { UserRequest } from 'models/request.models';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { prismaErrorHandler } from '../helpers/prismaErrorHandler';
import { UserCreateRequestDto } from './dto/userCreateRequest.dto';
import { UserEditPasswordRequestDto } from './dto/userEditPasswordRequest.dto';
import { UserEditRequestDto } from './dto/userEditRequest.dto';
import { UserQueryRequestDto } from './dto/userQueryRequest.dto';
import { UserResponseDto } from './dto/userResponse.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(200)
  @Post()
  async getUsers(
    @Body() query?: UserQueryRequestDto,
    @Query('skip', ParsePaginationPipe) from?: number,
    @Query('take', ParsePaginationPipe) to?: number,
  ): Promise<Paginated<UserResponseDto>> {
    const skip = from ? from : 0;
    //Make sure there is an upper limit to the amount of users queried
    const take = to ? to : 10;
    return this.usersService.findAllUnarchived({
      skip,
      take,
      orderBy: query?.sortParams,
      where: query?.searchParams,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Post('register')
  async registerUser(
    @Body() userCreateRequestDto: UserCreateRequestDto,
    @Request() req: UserRequest,
  ): Promise<UserResponseDto> {
    try {
      return await this.usersService.createUser(userCreateRequestDto, req.user);
    } catch (error) {
      throw prismaErrorHandler(error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put()
  async editUser(
    @Body() userEditRequestDto: UserEditRequestDto,
  ): Promise<UserResponseDto> {
    try {
      return await this.usersService.editUser(userEditRequestDto);
    } catch (error) {
      // If user to edit is not found in the db, throw NotFoundException
      // Temporary solution. Should use a dedicated exception filter for this
      throw prismaErrorHandler(error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Put('password')
  async editPassword(
    @Body() userEditPasswordRequestDto: UserEditPasswordRequestDto,
  ): Promise<UserResponseDto> {
    try {
      return await this.usersService.editPassword(userEditPasswordRequestDto);
    } catch (error) {
      throw prismaErrorHandler(error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('/:id')
  async archiveUser(
    @Param('id') id: string,
    @Request() req: UserRequest,
  ): Promise<UserResponseDto> {
    try {
      return await this.usersService.archiveUser(id, req.user.id);
    } catch (error) {
      // If user to archive is not found in the db, throw NotFoundException
      throw prismaErrorHandler(error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('viewer', 'editor', 'admin', 'super_admin')
  @Get('current')
  getCurrentUser(@Request() req: UserRequest): UserResponseDto {
    const { passwordChangeRequired, ...rest } = req.user;
    return rest;
  }
}
