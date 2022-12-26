import {
  Vehicle,
  VehicleBrand,
  VehicleCondition,
  VehicleDrive,
  VehicleType,
} from 'core';

export class VehicleDto implements Vehicle {
  chassisNumber: string;
  brand: VehicleBrand;
  model: string;
  engineNumber: string;
  capacity: number;
  passengerCapacity: number;
  carriageCapacity: number;
  yearOfBuilt: string;
  color: string;
  condition: VehicleCondition;
  vehicleType: VehicleType;
  drive: VehicleDrive;
  specificationStandard: string;
}
