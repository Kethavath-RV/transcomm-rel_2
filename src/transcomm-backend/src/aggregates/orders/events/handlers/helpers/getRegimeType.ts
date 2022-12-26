import { RegimeType } from "core";

export function getRegimeType(regimeType: string): string {
  switch(regimeType) {
    case RegimeType.Import:
      return "Import"
    case RegimeType.Export:
      return "Export"
    case RegimeType.Transit:
      return "Transit"
    case RegimeType.TemporaryAdmission:
      return "TemporaryAdmission"
    case RegimeType.Transfer:
      return "Transfer"
    default:
      return ""
  }
}
