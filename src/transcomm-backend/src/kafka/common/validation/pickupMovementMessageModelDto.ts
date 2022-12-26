import { IsNotEmpty } from 'class-validator';
import { PickupMovementsMessageModel } from 'core';
const decodeBase64 = require('atob');

export class PickupMovementsMessageModelDto
  implements PickupMovementsMessageModel
{
  @IsNotEmpty()
  msgType: string;
  sender: string;
  uuid: string;
  msgFilePath: string;
  @IsNotEmpty()
  messages: string;
  decodeMessage(): string {
    return decodeBase64(this.messages);
  }
}
