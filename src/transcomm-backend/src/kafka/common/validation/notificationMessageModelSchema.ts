import { IsNotEmpty } from "class-validator";
import { NotificationMessageModel, NotificationType } from "core";

export class NotificationMessageModelDto implements NotificationMessageModel {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  type: NotificationType;
  content: string;
}