import { Duty } from 'core';

export class DutyDto implements Duty {
  dutyType: string;
  dutyValue: number;
}
