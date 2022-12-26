import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HyperledgerResponseDto } from 'dto/hyperledgerResponse.dto';
import { ConfirmReturnDeliveryDatagenParametersDto } from './dto/confirmReturnDeliveryDatagenParameters.dto';
import { DeliverOrderDatagenParametersDto } from './dto/deliverOrderDatagenParameters.dto';
import { InitiateDeclarationDatagenParametersDto } from './dto/initiateDeclarationDatagenParameters.dto';
import { ReturnOrderDatagenParametersDto } from './dto/returnOrderDatagenParameters.dto';
import { SubmitOrderDatagenParametersDto } from './dto/submitOrderDatagenParameters.dto';
import { UpdateExitConfirmationDatagenParametersDto } from './dto/updateExitConfirmationDatagenParameters.dto';
import { UpdateTransportInfoDatagenParametersDto } from './dto/updateTransportInfoDatagenParameters.dto';
import { ServicelayerService } from './servicelayer/servicelayer.service';

@ApiTags('Hyperledger Invoke')
@Controller('invoke')
export class AppController {
  constructor(private readonly appService: ServicelayerService) {}

  @Post('submitOrder')
  @ApiResponse({
    status: 201,
    description: 'Submit transaction successful. Error object will be  null',
    type: HyperledgerResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error encountered during the transaction.',
  })
  submitOrder(
    @Body() request: SubmitOrderDatagenParametersDto,
  ): Promise<HyperledgerResponseDto> {
    return this.appService.invokeHLSubmitOrder(request);
  }

  @Post('returnOrder')
  @ApiResponse({
    status: 201,
    description: 'Submit transaction successful. Error object will be  null',
    type: HyperledgerResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error encountered during the transaction.',
  })
  returnOrder(
    @Body() request: ReturnOrderDatagenParametersDto,
  ): Promise<HyperledgerResponseDto> {
    return this.appService.invokeHLReturnOrder(request);
  }

  @Post('updateTransportInfo')
  @ApiResponse({
    status: 201,
    description: 'Submit transaction successful. Error object will be null',
    type: HyperledgerResponseDto,
  })
  updateTransportInfo(
    @Body()
    request: UpdateTransportInfoDatagenParametersDto,
  ): Promise<HyperledgerResponseDto> {
    return this.appService.invokeHLUpdateTransportInfo(request);
  }

  @Post('initiateDeclaration')
  @ApiResponse({
    status: 201,
    description: 'Submit transaction successful. Error object will be null',
    type: HyperledgerResponseDto,
  })
  initiateDeclaration(
    @Body()
    request: InitiateDeclarationDatagenParametersDto,
  ): Promise<HyperledgerResponseDto> {
    return this.appService.invokeHLInitiateDeclaration(request);
  }

  @Post('deliverOrder')
  @ApiResponse({
    status: 201,
    description: 'Submit transaction successful. Error object will be null',
    type: HyperledgerResponseDto,
  })
  deliverOrder(
    @Body()
    request: DeliverOrderDatagenParametersDto,
  ): Promise<HyperledgerResponseDto> {
    return this.appService.invokeHLDeliverOrder(request);
  }

  @Post('confirmReturnDelivery')
  @ApiResponse({
    status: 201,
    description: 'Submit transaction successful. Error object will be null',
    type: HyperledgerResponseDto,
  })
  confirmReturnDelivery(
    @Body()
    request: ConfirmReturnDeliveryDatagenParametersDto,
  ): Promise<HyperledgerResponseDto> {
    return this.appService.invokeHLConfirmReturnDelivery(request);
  }

  @Post('updateExitConfirmation')
  @ApiResponse({
    status: 201,
    description: 'Submit transaction successful. Error object will be null',
    type: HyperledgerResponseDto,
  })
  updateExitConfirmation(
    @Body()
    request: UpdateExitConfirmationDatagenParametersDto,
  ): Promise<HyperledgerResponseDto> {
    return this.appService.invokeHLUpdateExitConfirmation(request);
  }
}
