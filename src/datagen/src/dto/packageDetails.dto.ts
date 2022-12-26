import { PackageDetails, UnitOfMeasurement } from 'core';

export class PackageDetailsDto implements PackageDetails {
  packageType: UnitOfMeasurement;
  numberOfPackages: number;
  container: string[];
}
