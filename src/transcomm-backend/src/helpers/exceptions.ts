import { IsNumber, IsString } from 'class-validator';

export class ApplicationExceptionData {
  @IsNumber()
  status: number | null;
  @IsString()
  errorCode: string;
  @IsString()
  path: string;
  @IsString()
  timestamp: string;
  @IsString()
  descriptiveMessage: string;
  @IsString()
  errorMessage: string;
  @IsString()
  errorName: string;
}
