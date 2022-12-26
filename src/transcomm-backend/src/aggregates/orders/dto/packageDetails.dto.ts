import { PackageDetailsView } from 'core';

export class PackageDetailsDto implements PackageDetailsView {
  packageType: string;
  numberOfPackages: number;
  containerNumber: string;
  cargoType: string;
  netWeightAndUnit: string;
  containerSize: string;
  containerType: string;
  containerSealNumber: string;
  grossWeightAndUnit: string;
  volumetricWeightAndUnit: string;
}
