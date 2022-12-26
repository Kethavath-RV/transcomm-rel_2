import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { LockOrderCommand } from 'aggregates/orders/commands/impl/lock-order';
import { UnlockOrderCommand } from 'aggregates/orders/commands/impl/unlock-order';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { OrderService } from 'database/order.service';
import {
  CancelledOrderQueryRequest,
  ManualRetryQueryRequest,
  OrderExceptionQueryRequest,
  PurgeRetriesRequest,
  RetryManyRequest,
  ReturnedOrderQueryRequest,
  UserRequest,
} from 'models/request.models';
import { CreateAmendmentCommand } from './commands/impl/create-amendment';
import { OrderQueryRequestDto } from './dto/orderQueryRequest.dto';
import { OrderDto } from './dto/order.dto';
import { LockResponseDto } from './dto/lockResponse.dto';
import { AmendmentResponseDto } from './dto/amendmentResponse.dto';
import { AmendmentRequestDto } from './dto/amendmentRequest.dto';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ExceptionOverviewDto } from './dto/exceptionOverview.dto';
import { ContractMethod, Paginated } from 'core';
import { ReturnedOrderOverviewDto } from './dto/returnedOrderOverview.dto';
import { CancelledOrderOverviewDto } from './dto/cancelledOrderOverview.dto';
import { OrderOverviewDto } from './dto/orderOverview.dto';
import { OrderAggregateKey } from './order-aggregate-key';
import { ManualRetryDTO } from './dto/manualRetry.dto';

import { RetryHyperledgerCommand } from './commands/impl/retry-hyperledger';
import { ParsePaginationPipe } from 'helpers/nestPipes';

@ApiTags('Orders')
@Controller('api/orders')
export class OrdersController {
  constructor(
    private readonly orderService: OrderService,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('viewer', 'editor', 'admin')
  @Get(':ecomCode/:orderNumber/:invoiceNumber')
  async getOrderWithInvoiceById(
    @Param('ecomCode') ecomCode: string,
    @Param('orderNumber') orderNumber: string,
    @Param('invoiceNumber') invoiceNumber: string,
  ): Promise<OrderDto> {
    const result = await this.orderService.order(
      {
        orderNumber_ecomBusinessCode: {
          orderNumber: orderNumber,
          ecomBusinessCode: ecomCode,
        },
      },
      invoiceNumber,
    );
    if (result) return result;

    throw new NotFoundException('not found');
  }

  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('viewer', 'editor', 'admin')
  @Post('exceptions')
  @HttpCode(200)
  async getOrderOverviewExceptions(
    @Body() query?: OrderExceptionQueryRequest,
    @Query('skip', ParsePaginationPipe) from?: number,
    @Query('take', ParsePaginationPipe) to?: number,
  ): Promise<Paginated<ExceptionOverviewDto>> {
    const skip = from ? from : 0;
    const take = to ? to : 10;
    return this.orderService.ordersExceptionOverview({
      skip,
      take,
      orderBy: query?.sortParams,
      where: query?.searchParams,
    });
  }

  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('viewer', 'editor', 'admin')
  @Post('returnedOrders')
  @HttpCode(200)
  async getReturnedOrderOverviews(
    @Body() query?: ReturnedOrderQueryRequest,
    @Query('skip', ParsePaginationPipe) from?: number,
    @Query('take', ParsePaginationPipe) to?: number,
  ): Promise<Paginated<ReturnedOrderOverviewDto>> {
    const skip = from ? from : 0;
    const take = to ? to : 10;
    return this.orderService.returnedOrderOverviews({
      skip,
      take,
      orderBy: query?.sortParams,
      where: query?.searchParams,
    });
  }

  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('viewer', 'editor', 'admin')
  @Post('cancelledOrders')
  @HttpCode(200)
  async GetCancelledOrderOverviews(
    @Body() query?: CancelledOrderQueryRequest,
    @Query('skip', ParsePaginationPipe) from?: number,
    @Query('take', ParsePaginationPipe) to?: number,
  ): Promise<Paginated<CancelledOrderOverviewDto>> {
    const skip = from ? from : 0;
    const take = to ? to : 10;
    return this.orderService.cancelledOrderOverviews({
      skip,
      take,
      orderBy: query?.sortParams,
      where: query?.searchParams,
    });
  }

  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('viewer', 'editor', 'admin')
  @Post('overview')
  @HttpCode(200)
  async getOrderOverview(
    @Body() query?: OrderQueryRequestDto,
    @Query('skip', ParsePaginationPipe) from?: number,
    @Query('take', ParsePaginationPipe) to?: number,
  ): Promise<Paginated<OrderOverviewDto>> {
    const skip = from ? from : 0;
    const take = to ? to : 10;
    return this.orderService.ordersOverview({
      skip,
      take,
      orderBy: query?.sortParams,
      where: query?.searchParams,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor')
  @Post('amendment')
  async createAmendment(
    @Request() req: UserRequest,
    @Body() postData: AmendmentRequestDto,
  ): Promise<AmendmentResponseDto> {
    const { invoiceNumber, orderNumber, ecomBusinessCode } = postData;
    const invoice = await this.orderService.getInvoiceById(
      invoiceNumber,
      orderNumber,
      ecomBusinessCode,
    );
    if (!invoice)
      throw new NotFoundException(
        `No invoice found with invoiceNo, orderNumber, ecomBusinessCode: ${invoiceNumber}, ${orderNumber}, ${ecomBusinessCode}`,
      );
    await this.commandBus.execute(
      new CreateAmendmentCommand(
        new OrderAggregateKey(orderNumber, ecomBusinessCode),
        invoice.orderNumber,
        invoice.ecomBusinessCode,
        invoice.invoiceNumber,
        req.user.email,
        postData,
      ),
    );
    return { message: 'Amendment stored' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor')
  @Post(':ecomCode/:orderNumber/:invoiceId/lock')
  async lockOrder(
    @Request() req: UserRequest,
    @Param('orderNumber') orderNumber: string,
    @Param('ecomCode') ecomCode: string,
    @Param('invoiceId') invoiceId: string,
  ): Promise<LockResponseDto> {
    await this.commandBus.execute(
      new LockOrderCommand(
        new OrderAggregateKey(orderNumber, ecomCode),
        orderNumber,
        invoiceId,
        req.user.email,
      ),
    );
    return { message: 'Order locked', email: req.user.email };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('editor', 'admin')
  @Post(':ecomCode/:orderNumber/:invoiceId/unlock')
  async unlockOrder(
    @Request() req: UserRequest,
    @Param('orderNumber') orderNumber: string,
    @Param('ecomCode') ecomCode: string,
    @Param('invoiceId') invoiceId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new UnlockOrderCommand(
        new OrderAggregateKey(orderNumber, ecomCode),
        orderNumber,
        invoiceId,
        req.user,
      ),
    );
  }

  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('retries')
  @HttpCode(200)
  async getRetries(
    @Body() query?: ManualRetryQueryRequest,
    @Query('skip', ParsePaginationPipe) from?: number,
    @Query('take', ParsePaginationPipe) to?: number,
  ): Promise<Paginated<ManualRetryDTO>> {
    const skip = from ? from : 0;
    const take = to ? to : 10;
    return this.orderService.manualRetries({
      skip,
      take,
      orderBy: query?.sortParams,
      where: query?.searchParams,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('retries/purge')
  @HttpCode(200)
  @HttpCode(400)
  async purgeRetries(@Body() body: PurgeRetriesRequest): Promise<void> {
    const newData = body.data.map(
      ({ orderNumber, invoiceNumber, ecomCode, contractMethod }) => ({
        orderNumber,
        invoiceNumber,
        ecomCode,
        contractMethod,
      }),
    );
    return this.orderService.deleteManualRetries(newData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('retries/retryMany')
  @HttpCode(200)
  @HttpCode(400)
  async retryMany(@Request() req: RetryManyRequest): Promise<void> {
    req.body.data.forEach(async (x) => {
      const contractMethod: ContractMethod = ContractMethod[x.contractMethod];
      await this.commandBus.execute(
        new RetryHyperledgerCommand(
          new OrderAggregateKey(x.orderNumber, x.ecomCode),
          x.orderNumber,
          x.ecomCode,
          x.invoiceNumber,
          contractMethod,
          req.user.email,
          x.vcId,
          x.remark,
        ),
      );
    });
  }
}
