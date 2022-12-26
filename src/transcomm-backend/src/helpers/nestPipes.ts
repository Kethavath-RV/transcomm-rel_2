import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParsePaginationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  transform(value: any, metadata: ArgumentMetadata): number | null {
    if(!value){
        return null
    }
    else if(isNaN(Number(value))){
        throw new BadRequestException('Skip/Take argument must be number');
    }
    else{
        //Make sure there is an upper limit of 100 to the amount of orders queried
        return Math.min(Math.abs(value), 100)
    }
  }
}